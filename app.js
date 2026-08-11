// app.js
const { API_BASE_URL } = require('./utils/config')
App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'cloud1-2gxcddy05981d85a'
    })
    // 小程序启动时执行的逻辑
    console.log('小程序启动了')

    // 检查登录状态，如果没登录则跳转登录页
    const token = wx.getStorageSync('token')
    if (!token) {
      // 可以根据实际需求决定是否自动跳转
      console.log('未登录')
    }

    // 将旧版全局存储的数据迁移到当前用户的隔离存储（一次性）
    this.migrateToUserStorage()

    // 清空测试阶段遗留的预约/儿童/日志等本地假数据（仅一次）
    this.clearTestDataOnce()
  },

  // 一次性迁移：旧版所有用户共用同一个 storage key，现在按 openId 隔离
  migrateToUserStorage: function () {
    const openId = this.getCurrentOpenId()
    if (openId === 'guest') return

    const keysToMigrate = ['activity_logs', 'myReservations', 'myChildren', 'course_reminded_ids', 'allNoticeData']
    let migrated = false

    keysToMigrate.forEach(key => {
      const oldValue = wx.getStorageSync(key)
      const hasOldData = oldValue !== '' && oldValue !== undefined && oldValue !== null
      if (!hasOldData) return

      const userKey = this.getUserStorageKey(key)
      const existing = wx.getStorageSync(userKey)
      const hasUserData = existing !== '' && existing !== undefined && existing !== null

      if (!hasUserData) {
        wx.setStorageSync(userKey, oldValue)
        migrated = true
        console.log(`[Migrate] ${key} -> ${userKey}`)
      }

      // 迁移后删除旧的全局 key，避免未登录时还能看到其他账号数据
      wx.removeStorageSync(key)
    })

    if (migrated) {
      console.log('[Migrate] 用户隔离存储迁移完成')
    }
  },

  onShow: function () {
    // 每次小程序回到前台时，检查是否有课程即将开始（15 分钟内）
    this.checkUpcomingCourses()
  },

  globalData: {
    // 全局数据
    userInfo: null,
    API_BASE_URL,
    notifications: [], // 用于存储通知的数组
    // 仅在本次小程序运行期间保存财税聊天，避免持久化儿童对话。
    taxAgentChat: null
  },

  // ========== 用户隔离存储工具 ==========
  // 获取当前登录用户的 openId，未登录时返回 'guest'
  getCurrentOpenId: function () {
    return wx.getStorageSync('openId') || 'guest'
  },

  // 生成带用户前缀的 storage key，例如 activity_logs_oNI9Iv...
  getUserStorageKey: function (key) {
    const openId = this.getCurrentOpenId()
    return `${key}_${openId}`
  },

  // 读取当前用户的本地缓存
  getUserStorage: function (key) {
    return wx.getStorageSync(this.getUserStorageKey(key))
  },

  // 写入当前用户的本地缓存
  setUserStorage: function (key, value) {
    wx.setStorageSync(this.getUserStorageKey(key), value)
  },

  // 规范化教师信息：所有课程电话统一，音乐课单独指定老师
  getStandardTeacher: function (courseName, rawName) {
    const isMusicCourse = courseName && String(courseName).includes('听见旋律里的心情')
    return {
      name: isMusicCourse ? '陈劲' : (rawName || '小明'),
      phone: '13660566366'
    }
  },

  // 移除当前用户的本地缓存
  removeUserStorage: function (key) {
    wx.removeStorageSync(this.getUserStorageKey(key))
  },

  // 从云端加载儿童列表并同步到本地缓存（离线兜底 + 兼容同步读取的页面）
  // 返回 Promise<list>，list 中每个儿童以云数据库 _id 作为唯一 id
  loadChildrenFromCloud: function () {
    const self = this
    return new Promise(function (resolve) {
      if (!wx.cloud) {
        resolve(self.getUserStorage('myChildren') || [])
        return
      }
      wx.cloud.callFunction({
        name: 'children',
        data: { action: 'list' }
      }).then(function (res) {
        if (res.result && res.result.code === 0) {
          const localList = self.getUserStorage('myChildren') || []
          const cloudList = (res.result.data || []).map(function (c) {
            return Object.assign({}, c, { id: c._id })
          })
          // 防御：云端返回空但本地有数据时，优先保留本地，避免 add 未同步完成或查询延迟导致显示空白
          const finalList = cloudList.length > 0 ? cloudList : localList
          self.setUserStorage('myChildren', finalList)
          resolve(finalList)
        } else {
          resolve(self.getUserStorage('myChildren') || [])
        }
      }).catch(function () {
        resolve(self.getUserStorage('myChildren') || [])
      })
    })
  },

  // 一次性清理测试遗留数据（仅在初次启动时执行一次）
  // 清空本地预约缓存、儿童缓存、活动日志、课程提醒及人数缓存，
  // 保证从云端拉取的是干净数据，避免旧设备上的假测试数据串入
  clearTestDataOnce: function () {
    const flag = wx.getStorageSync('__cleared_test_data_v1')
    if (flag) return
    try {
      const allKeys = wx.getStorageInfoSync().keys
      const patterns = /^(myReservations|myChildren|activity_logs|course_reminded_ids)_/
      allKeys.forEach(function (k) {
        if (patterns.test(k) || k.indexOf('reserved_course_') === 0 || k === 'cloud_course_counts') {
          wx.removeStorageSync(k)
        }
      })
      wx.setStorageSync('__cleared_test_data_v1', true)
      console.log('[Cleanup] 已清理本地测试遗留数据')
    } catch (e) {
      console.error('[Cleanup] 清理异常', e)
    }
  },

  // 添加通知的方法
  addNotification: function (courseName) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();
    const notification = {
      id: this.globalData.notifications.length + 1,
      courseName: courseName,
      time: `${date} ${time}`
    };
    this.globalData.notifications.push(notification);
    console.log('Notification added:', notification);

    // 将最新通知存储到本地缓存
    let storedNotifications = wx.getStorageSync('notifications') || [];
    storedNotifications.unshift(notification);
    wx.setStorageSync('notifications', storedNotifications);
  },

  // ========== 活动日志系统 ==========
  // 统一记录用户操作（登录/添加儿童/预约课程/取消课程等）
  // 存储到本地 activity_logs，供 notice.js 的"系统通知"读取
  recordActivityLog: function (options) {
    const opts = options || {}
    const now = new Date()
    const timestamp = now.getTime()

    const pad = n => String(n).padStart(2, '0')
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

    const log = {
      id: 'log_' + timestamp + '_' + Math.random().toString(36).substr(2, 6),
      type: opts.type || 'system',         // system / child / course
      title: opts.title || '操作记录',
      summary: opts.summary || '',
      time: dateStr,
      fullTime: `${dateStr} ${timeStr}`,
      timestamp: timestamp,
      icon: opts.icon || '🔔',
      color: opts.color || '#667eea',
      isRead: false
    }

    let logs = this.getUserStorage('activity_logs') || []
    if (!Array.isArray(logs)) logs = []
    logs.unshift(log)
    // 最多保留 100 条记录
    if (logs.length > 100) logs = logs.slice(0, 100)
    this.setUserStorage('activity_logs', logs)

    console.log('[ActivityLog] 已记录:', log.title, log.summary)
    return log
  },

  // 检查即将开始的课程（距离开始 ≤15 分钟）并弹本地提醒
  checkUpcomingCourses: function () {
    try {
      const myReservations = this.getUserStorage('myReservations') || []
      if (!Array.isArray(myReservations) || myReservations.length === 0) return

      // 已提醒过的课程 id（避免每次 onShow 都重复弹窗）
      const remindedIds = this.getUserStorage('course_reminded_ids') || []

      // 课程日期映射：把 "8月10日" 解析为今年日期
      const currentYear = new Date().getFullYear()
      const parseDateStr = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null
        const m = dateStr.match(/(\d+)月(\d+)日/)
        if (!m) return null
        const month = parseInt(m[1])
        const day = parseInt(m[2])
        // 解析时间段 "09:00-11:00" 的开始时间
        const startTime = (timeStr || '').split('-')[0].trim() || '09:00'
        const [hh, mm] = startTime.split(':').map(s => parseInt(s))
        return new Date(currentYear, month - 1, day, hh, mm).getTime()
      }

      const now = Date.now()
      const FIFTEEN_MIN = 15 * 60 * 1000

      myReservations.forEach(r => {
        if (remindedIds.includes(r.courseId)) return
        const startTs = parseDateStr(r.date, r.time)
        if (!startTs) return
        const diff = startTs - now
        // 提前 15 分钟到开课之间都提醒
        if (diff > 0 && diff <= FIFTEEN_MIN) {
          // 写一条提醒到本地
          const remindLog = {
            id: 'remind_' + startTs + '_' + r.courseId,
            type: 'course',
            title: '上课提醒',
            summary: `您预约的「${r.courseName}」将于 ${r.date} ${(r.time || '').split('-')[0]} 在「${r.location || ''}」开始，请准时参加`,
            time: new Date().toISOString().slice(0, 10),
            fullTime: new Date().toLocaleString('zh-CN'),
            timestamp: Date.now(),
            icon: '⏰',
            color: '#ff7a45',
            isRead: false
          }
          let logs = this.getUserStorage('activity_logs') || []
          if (!Array.isArray(logs)) logs = []
          // 避免重复添加同样的提醒
          if (!logs.some(l => l.id === remindLog.id)) {
            logs.unshift(remindLog)
            if (logs.length > 100) logs = logs.slice(0, 100)
            this.setUserStorage('activity_logs', logs)
          }
          // 标记已提醒
          remindedIds.push(r.courseId)
          this.setUserStorage('course_reminded_ids', remindedIds)

          // 弹本地弹窗
          wx.showModal({
            title: '⏰ 上课提醒',
            content: `您预约的「${r.courseName}」将于 ${(r.time || '').split('-')[0]} 开始，请准时参加`,
            showCancel: false,
            confirmText: '我知道了'
          })
        }
      })
    } catch (e) {
      console.error('[checkUpcomingCourses] 异常', e)
    }
  }
})
