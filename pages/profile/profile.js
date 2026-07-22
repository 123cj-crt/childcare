// profile.js
Page({
  data: {
    avatarUrl: '/icon/my.png', // 默认头像
    nickName: '未登录', // 默认昵称
    isLoggedIn: false, // 登录状态
  },

  onLoad: function () {
    // 清除可能存在的默认用户信息
    this.clearDefaultUserInfo();
    this.checkLoginStatus();
    // 调试：测试用户信息同步
    this.testUserInfoSync();
  },

  onShow: function () {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
  },

  // 手动刷新用户信息
  refreshUserInfo: function() {
    console.log('手动刷新用户信息');
    this.checkLoginStatus();
  },

  // 测试用户信息同步（调试用）
  testUserInfoSync: function() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    console.log('=== 用户信息同步测试 ===');
    console.log('存储的用户信息:', userInfo);
    console.log('存储的token:', token);
    console.log('当前页面数据:', this.data);
    console.log('=== 测试结束 ===');
  },

  // 清除默认用户信息
  clearDefaultUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && (userInfo.nickName === '微信用户' || userInfo.nickName === '未登录')) {
      wx.removeStorageSync('userInfo');
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    console.log('Profile页面检查登录状态:', { userInfo, token });
    
    // 检查是否有有效的用户信息和token
    const hasValidUserInfo = userInfo && 
                            userInfo.nickName && 
                            userInfo.nickName.trim() !== '' && 
                            userInfo.nickName !== '未登录' && 
                            userInfo.nickName !== '微信用户';
    
    const hasValidToken = token && token.trim() !== '';
    
    if (hasValidUserInfo && hasValidToken) {
      // 已登录状态
      console.log('用户已登录，更新用户信息:', userInfo);
      this.setData({
        avatarUrl: userInfo.avatarUrl || '/icon/my.png',
        nickName: userInfo.nickName,
        isLoggedIn: true
      });
    } else {
      // 未登录状态
      console.log('用户未登录，显示默认状态');
      this.setData({
        avatarUrl: '/icon/my.png',
        nickName: '未登录',
        isLoggedIn: false
      });
    }
  },

  // 跳转到登录页面
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 显示登录提示弹窗
  showLoginPrompt: function() {
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
    })
  },

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
          wx.clearStorage();
          this.setData({
            isLoggedIn: false,
            nickName: '未登录',
            avatarUrl: '/icon/my.png'
          });
        }
      }
    });
  },

  contactUs: function () {
    // 联系我们的逻辑
    wx.showModal({
      title: '联系我们',
      content: '请拨打客服热线：123-4567-8901',
      showCancel: false
    })
  },
})
