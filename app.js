// app.js
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
  },

  onShow: function () {
    // 每次小程序回到前台时，检查是否有课程即将开始（15 分钟内）
    this.checkUpcomingCourses()
  },

  globalData: {
    // 全局数据
    userInfo: null,
    API_BASE_URL: 'http://gdufe-childcare.cn:8080', // 新服务器地址
    notifications: [] // 用于存储通知的数组
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

    let logs = wx.getStorageSync('activity_logs') || []
    if (!Array.isArray(logs)) logs = []
    logs.unshift(log)
    // 最多保留 100 条记录
    if (logs.length > 100) logs = logs.slice(0, 100)
    wx.setStorageSync('activity_logs', logs)

    console.log('[ActivityLog] 已记录:', log.title, log.summary)
    return log
  },

  // 检查即将开始的课程（距离开始 ≤15 分钟）并弹本地提醒
  checkUpcomingCourses: function () {
    try {
      const myReservations = wx.getStorageSync('myReservations') || []
      if (!Array.isArray(myReservations) || myReservations.length === 0) return

      // 已提醒过的课程 id（避免每次 onShow 都重复弹窗）
      const remindedIds = wx.getStorageSync('course_reminded_ids') || []

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
          let logs = wx.getStorageSync('activity_logs') || []
          if (!Array.isArray(logs)) logs = []
          // 避免重复添加同样的提醒
          if (!logs.some(l => l.id === remindLog.id)) {
            logs.unshift(remindLog)
            if (logs.length > 100) logs = logs.slice(0, 100)
            wx.setStorageSync('activity_logs', logs)
          }
          // 标记已提醒
          remindedIds.push(r.courseId)
          wx.setStorageSync('course_reminded_ids', remindedIds)

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
