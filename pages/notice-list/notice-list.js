// pages/notice-list/notice-list.js
const app = getApp()

// ========== 调试模式 ==========
const DEBUG_MOCK_NOTICES = true
// =================================

Page({
  data: {
    type: '',
    icon: '',
    color: '',
    notices: [],
    emptyText: '暂无通知'
  },

  onLoad(options) {
    const type = decodeURIComponent(options.type || '')
    const icon = decodeURIComponent(options.icon || '📢')
    const color = decodeURIComponent(options.color || '#4a90d9')

    let emptyText = '暂无通知'
    if (type === '公告通知') emptyText = '暂无公告'
    if (type === '孩子沟通') emptyText = '暂无沟通记录'
    if (type === '系统通知') emptyText = '暂无系统通知'

    this.setData({ type, icon, color, emptyText })
    this.loadNotices(type)
  },

  onShow() {
    if (this.data.type) {
      this.loadNotices(this.data.type)
    }
  },

  loadNotices(type) {
    if (DEBUG_MOCK_NOTICES && type === '公告通知') {
      const notices = wx.getStorageSync('notice_announcements') || []
      this.setData({ notices: this.formatNoticeList(notices) })
      return
    }

    const allData = wx.getStorageSync('allNoticeData') || {}
    const notices = allData[type] || []
    this.setData({ notices: this.formatNoticeList(notices) })
  },

  formatNoticeList(notices) {
    if (!Array.isArray(notices)) return []
    return notices.map(n => ({
      id: n.id,
      title: n.title || '',
      summary: n.summary || n.content || '',
      time: n.time || (n.sendTime ? n.sendTime.split(' ')[0] : ''),
      isRead: n.isRead,
      icon: n.icon || this.data.icon || '📢',
      color: n.color || this.data.color || '#4a90d9'
    }))
  },

  goNoticeDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  }
})
