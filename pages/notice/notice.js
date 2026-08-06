// pages/notice/notice.js
const app = getApp()

// ========== 调试模式 ==========
const DEBUG_MOCK_NOTICES = true

const MOCK_ANNOUNCEMENTS = [
  {
    id: 'guide_001',
    title: '小程序使用指南',
    summary: '首次使用必读：登录、绑定儿童、浏览课程、预约课程等完整操作指引',
    time: '2026-07-31',
    isRead: false,
    type: 'announcement',
    icon: '📖',
    color: '#4a90d9'
  },
  {
    id: 'guide_002',
    title: '2026年暑期税收科普课程安排',
    summary: '8月10日-14日税收科普系列课程已开放预约，共10节精品课程',
    time: '2026-07-30',
    isRead: false,
    type: 'announcement',
    icon: '📚',
    color: '#e6a23c'
  }
]
// =================================

Page({
  data: {
    noticeCount: {
      notice1: 0,
      notice2: 0,
      notice3: 0
    },
    allNoticeData: {
      "公告通知": [],
      "孩子沟通": [],
      "系统通知": []
    }
  },

  onLoad() {
    this.loadAllNotices()
  },

  onShow() {
    this.loadAllNotices()
  },

  loadAllNotices() {
    this.loadAnnouncements()
    this.loadReminders()
    this.loadStudentNotices()
  },

  loadAnnouncements() {
    if (DEBUG_MOCK_NOTICES) {
      const formatted = this.formatNotices(MOCK_ANNOUNCEMENTS)
      const unreadCount = MOCK_ANNOUNCEMENTS.filter(n => !n.isRead).length
      this.setData({
        'allNoticeData.公告通知': formatted,
        'noticeCount.notice1': unreadCount
      })
      wx.setStorageSync('notice_announcements', MOCK_ANNOUNCEMENTS)
      return
    }

    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/notices/announcements`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const notices = res.data.data || []
          const formatted = this.formatNotices(notices)
          const unreadCount = notices.filter(n => !n.isRead).length
          this.setData({
            'allNoticeData.公告通知': formatted,
            'noticeCount.notice1': unreadCount
          })
          wx.setStorageSync('notice_announcements', notices)
        }
      },
      fail: (err) => {
        console.error('获取公告通知失败', err)
      }
    })
  },

  loadReminders() {
    // 系统通知 = 本地活动日志（登录、添加儿童、预约/取消课程、上课提醒等）
    // 按当前登录用户隔离，换账号后不会看到其他账号的通知
    // DEBUG 模式：附加演示数据，便于用户首次进入时看到效果
    let localLogs = app.getUserStorage('activity_logs') || []
    if (!Array.isArray(localLogs)) localLogs = []

    if (DEBUG_MOCK_NOTICES) {
      // 仅当用户没有任何活动日志时才展示演示数据
      let reminders
      if (localLogs.length > 0) {
        reminders = localLogs
      } else {
        const now = Date.now()
        const minute = 60 * 1000
        const demoReminders = [
          {
            id: 'demo_1',
            type: 'system',
            title: '登录成功',
            summary: '智慧托育用户 登录了小程序',
            time: this.formatDateOnly(new Date(now - 30 * 60 * 1000)),
            fullTime: this.formatDateTime(new Date(now - 30 * 60 * 1000)),
            timestamp: now - 30 * minute,
            icon: '🔐',
            color: '#667eea',
            isRead: false
          },
          {
            id: 'demo_2',
            type: 'child',
            title: '添加儿童',
            summary: '已成功添加儿童「小明」（5岁，男）',
            time: this.formatDateOnly(new Date(now - 2 * 60 * 60 * 1000)),
            fullTime: this.formatDateTime(new Date(now - 2 * 60 * 60 * 1000)),
            timestamp: now - 2 * 60 * minute,
            icon: '👶',
            color: '#52c41a',
            isRead: false
          },
          {
            id: 'demo_3',
            type: 'course',
            title: '预约课程',
            summary: '已为「小明」预约「税启新知——税收课堂开班典礼」（8月10日 09:00-11:00）',
            time: this.formatDateOnly(new Date(now - 24 * 60 * 60 * 1000)),
            fullTime: this.formatDateTime(new Date(now - 24 * 60 * 60 * 1000)),
            timestamp: now - 24 * 60 * minute,
            icon: '📅',
            color: '#4f7cff',
            isRead: false
          }
        ]
        reminders = demoReminders
      }

      this.applyReminders(reminders)
      return
    }

    // 真实模式：先拉后端 /api/notices/reminders，再和本地日志合并（按 id 去重，按 timestamp 倒序）
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/notices/reminders`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        let serverReminders = []
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          serverReminders = res.data.data || []
          if (!Array.isArray(serverReminders)) serverReminders = []
        }
        // 合并：本地 + 服务器（按 id 去重）
        const merged = [...localLogs]
        const localIds = new Set(localLogs.map(l => l.id))
        serverReminders.forEach(s => {
          if (!localIds.has(s.id)) merged.push(s)
        })
        this.applyReminders(merged)
      },
      fail: (err) => {
        console.error('获取提醒事项失败', err)
        // 即使请求失败，也用本地日志
        this.applyReminders(localLogs)
      }
    })
  },

  // 把"系统通知"列表渲染并同步到存储（统一处理）
  applyReminders(reminders) {
    if (!Array.isArray(reminders)) reminders = []
    // 按 timestamp 倒序
    reminders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

    const formatted = this.formatNotices(reminders)
    const unreadCount = reminders.filter(n => !n.isRead).length
    this.setData({
      'allNoticeData.系统通知': formatted,
      'noticeCount.notice3': unreadCount
    })

    // 同步到 notice-list.js 的存储（兜底），按用户隔离
    app.setUserStorage('allNoticeData', this.data.allNoticeData)
  },

  // 日期格式化辅助
  formatDateOnly(date) {
    const d = date instanceof Date ? date : new Date(date)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  },

  formatDateTime(date) {
    const d = date instanceof Date ? date : new Date(date)
    const pad = n => String(n).padStart(2, '0')
    return `${this.formatDateOnly(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  },

  loadStudentNotices() {
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/child/list`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const children = res.data.data || []
          if (children.length === 0) {
            this.setData({
              'allNoticeData.孩子沟通': [],
              'noticeCount.notice2': 0
            })
            return
          }
          const studentId = children[0].id
          this.requestStudentNotices(studentId)
        }
      },
      fail: (err) => {
        console.error('获取孩子列表失败', err)
      }
    })
  },

  requestStudentNotices(studentId) {
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/notices/student/${studentId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const notices = res.data.data || []
          const formatted = this.formatNotices(notices)
          const unreadCount = notices.filter(n => !n.isRead).length
          this.setData({
            'allNoticeData.孩子沟通': formatted,
            'noticeCount.notice2': unreadCount
          })
        }
      },
      fail: (err) => {
        console.error('获取学生通知失败', err)
      }
    })
  },

  formatNotices(notices) {
    if (!Array.isArray(notices)) return []
    return notices.map(n => ({
      id: n.id,
      title: n.title || '',
      summary: n.summary || n.content || '',
      time: n.time || (n.sendTime ? n.sendTime.split(' ')[0] : ''),
      isRead: n.isRead,
      type: n.type,
      icon: n.icon || '📢',
      color: n.color || '#4a90d9'
    }))
  },

  goNoticeList(e) {
    const type = e.currentTarget.dataset.type
    const icon = e.currentTarget.dataset.icon
    const color = e.currentTarget.dataset.color

    wx.navigateTo({
      url: `/pages/notice-list/notice-list?type=${encodeURIComponent(type)}&icon=${encodeURIComponent(icon)}&color=${encodeURIComponent(color)}`
    })
  }
})
