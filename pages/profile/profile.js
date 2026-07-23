// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    avatarUrl: '/icon/my.png',
    nickName: '未登录',
    isLoggedIn: false
  },

  onLoad: function () {
    this.checkLoginStatus();
  },

  onShow: function () {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');

    const hasValidUserInfo = userInfo &&
      userInfo.nickName &&
      userInfo.nickName.trim() !== '' &&
      userInfo.nickName !== '未登录' &&
      userInfo.nickName !== '微信用户';

    const hasValidToken = token && token.trim() !== '';

    if (hasValidUserInfo && hasValidToken) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || '/icon/my.png',
        nickName: userInfo.nickName,
        isLoggedIn: true
      });
    } else {
      this.setData({
        avatarUrl: '/icon/my.png',
        nickName: '未登录',
        isLoggedIn: false
      });
    }
  },

  // 跳转到登录页面
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 显示登录提示弹窗
  showLoginPrompt: function () {
    wx.showModal({
      title: '提示',
      content: '请先登录后再使用此功能',
      showCancel: true,
      cancelText: '取消',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          this.goToLogin();
        }
      }
    });
  },

  viewChildren() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.navigateTo({
      url: '/pages/bindchild/bindchild'
    });
  },

  myCourses() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.switchTab({
      url: '/pages/schedule/schedule'
    });
  },

  // 退出登录
  logout() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }

    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 如果后端有登出接口，在这里调用
          // wx.request({
          //   url: `${app.globalData.API_BASE_URL}/api/wechat/logout`,
          //   method: 'POST',
          //   header: { 'X-WX-OPENID': wx.getStorageSync('openId') }
          // })

          // 只清除登录相关的存储，保留其他数据
          wx.removeStorageSync('token');
          wx.removeStorageSync('openId');
          wx.removeStorageSync('userInfo');

          this.setData({
            isLoggedIn: false,
            nickName: '未登录',
            avatarUrl: '/icon/my.png'
          });

          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  contactUs: function () {
    wx.showModal({
      title: '联系我们',
      content: '请拨打客服热线：123-4567-8901',
      showCancel: false
    });
  }
})
