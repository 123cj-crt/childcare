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
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/notices/reminders`,
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
            'allNoticeData.系统通知': formatted,
            'noticeCount.notice3': unreadCount
          })
        }
      },
      fail: (err) => {
        console.error('获取提醒事项失败', err)
      }
    })
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
