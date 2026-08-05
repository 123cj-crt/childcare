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
    let notices = allData[type] || []

    // 系统通知直接从 activity_logs 读取（兜底，防止 allNoticeData 丢失）
    if (type === '系统通知') {
      const logs = wx.getStorageSync('activity_logs') || []
      if (!Array.isArray(notices) || notices.length === 0) {
        notices = logs
      }
    }

    this.setData({ notices: this.formatNoticeList(notices) })
  },

  formatNoticeList(notices) {
    if (!Array.isArray(notices)) return []
    return notices.map(n => {
      // 优先展示完整时间（带时分秒），没有时回退到日期
      const displayTime = n.fullTime || n.time || (n.sendTime ? n.sendTime.split(' ')[0] : '')
      return {
        id: n.id,
        title: n.title || '',
        summary: n.summary || n.content || '',
        time: displayTime,
        isRead: n.isRead,
        icon: n.icon || this.data.icon || '📢',
        color: n.color || this.data.color || '#4a90d9'
      }
    })
  },

  goNoticeDetail(e) {
    const id = e.currentTarget.dataset.id

    // 系统通知（活动日志）没有详情页，点击只标记已读
    if (this.data.type === '系统通知') {
      this.markAsRead(id)
      return
    }

    // 公告通知走详情页
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  },

  // 标记活动日志为已读
  markAsRead(id) {
    let logs = wx.getStorageSync('activity_logs') || []
    if (!Array.isArray(logs)) logs = []

    let changed = false
    logs = logs.map(log => {
      if (log.id === id && !log.isRead) {
        changed = true
        return { ...log, isRead: true }
      }
      return log
    })

    if (changed) {
      wx.setStorageSync('activity_logs', logs)
      // 同步刷新本页 + 同步到 notice 首页的 allNoticeData
      this.loadNotices(this.data.type)
      const allData = wx.getStorageSync('allNoticeData') || {}
      if (allData && allData['系统通知']) {
        allData['系统通知'] = logs
        wx.setStorageSync('allNoticeData', allData)
      }
      wx.showToast({ title: '已标记为已读', icon: 'none', duration: 800 })
    }
  }
})
