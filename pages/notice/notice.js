// pages/notice/notice.js
const app = getApp()

Page({
  data: {
    // 各类通知未读数量
    noticeCount: {
      notice1: 0,
      notice2: 0,
      notice3: 0
    },
    // 通知数据，按分类存储
    allNoticeData: {
      "公告通知": [],
      "孩子沟通": [],
      "系统通知": []
    }
  },

  onLoad() {
    this.loadAllNotices();
  },

  onShow() {
    // 每次显示时刷新未读状态
    this.loadAllNotices();
  },

  // 加载所有通知
  loadAllNotices() {
    this.loadAnnouncements();
    this.loadReminders();
    this.loadStudentNotices();
  },

  // 加载公告通知
  loadAnnouncements() {
    const openId = wx.getStorageSync('openId');

    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/notices/announcements`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        // notices 返回 R<> 格式
        if (res.statusCode === 200 && res.data.code === 200) {
          const notices = res.data.data || [];
          const formatted = this.formatNotices(notices);
          const unreadCount = notices.filter(n => !n.isRead).length;

          this.setData({
            'allNoticeData.公告通知': formatted,
            'noticeCount.notice1': unreadCount
          });
        }
      },
      fail: (err) => {
        console.error('获取公告通知失败', err);
      }
    });
  },

  // 加载提醒事项（对应"系统通知"）
  loadReminders() {
    const openId = wx.getStorageSync('openId');

    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/notices/reminders`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const notices = res.data.data || [];
          const formatted = this.formatNotices(notices);
          const unreadCount = notices.filter(n => !n.isRead).length;

          this.setData({
            'allNoticeData.系统通知': formatted,
            'noticeCount.notice3': unreadCount
          });
        }
      },
      fail: (err) => {
        console.error('获取提醒事项失败', err);
      }
    });
  },

  // 加载按学生查通知（对应"孩子沟通"）
  loadStudentNotices() {
    const openId = wx.getStorageSync('openId');

    // 先获取孩子列表，拿到 studentId
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/child/list`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const children = res.data.data || [];

          if (children.length === 0) {
            // 没有绑定孩子，显示空
            this.setData({
              'allNoticeData.孩子沟通': [],
              'noticeCount.notice2': 0
            });
            return;
          }

          // 用第一个孩子的 id 查通知（如果有多个孩子可扩展）
          const studentId = children[0].id;
          this.requestStudentNotices(studentId);
        }
      },
      fail: (err) => {
        console.error('获取孩子列表失败', err);
      }
    });
  },

  // 请求指定学生的通知
  requestStudentNotices(studentId) {
    const openId = wx.getStorageSync('openId');

    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/notices/student/${studentId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const notices = res.data.data || [];
          const formatted = this.formatNotices(notices);
          const unreadCount = notices.filter(n => !n.isRead).length;

          this.setData({
            'allNoticeData.孩子沟通': formatted,
            'noticeCount.notice2': unreadCount
          });
        }
      },
      fail: (err) => {
        console.error('获取学生通知失败', err);
      }
    });
  },

  // 格式化通知数据，统一字段名供 WXML 使用
  formatNotices(notices) {
    if (!Array.isArray(notices)) return [];
    return notices.map(n => ({
      id: n.id,
      title: n.title || '',
      content: n.content || '',
      time: n.sendTime ? n.sendTime.split(' ')[0] : '',
      isRead: n.isRead,
      type: n.type
    }));
  },

  // 点击分类跳转通知列表页
  goNoticeList(e) {
    const type = e.currentTarget.dataset.type;
    const icon = e.currentTarget.dataset.icon;
    const color = e.currentTarget.dataset.color;

    wx.navigateTo({
      url: `/pages/notice-list/notice-list?type=${encodeURIComponent(type)}&icon=${encodeURIComponent(icon)}&color=${encodeURIComponent(color)}`
    });
  }
})
