const app = getApp();
const { wechatLoginMode } = require('../../utils/config');
const { loginWithWechat } = require('../../services/wechat-auth');

Page({
  data: {
    agreeChecked: false,
    loggingIn: false
  },

  goToUserProtocol() {
    wx.navigateTo({ url: '/pages/userPolicy/userPolicy' });
  },

  onAgreementChange(event) {
    this.setData({ agreeChecked: event.detail.value.length > 0 });
  },

  quickLogin() {
    if (!this.data.agreeChecked) {
      wx.showToast({ title: '请勾选协议后登录', icon: 'none' });
      return;
    }
    if (this.data.loggingIn) return;

    if (wechatLoginMode === 'mock') {
      this.mockLogin();
      return;
    }

    this.setData({ loggingIn: true });
    this.getOptionalProfile()
      .then((profile) => loginWithWechat(profile))
      .then((identity) => {
        const nickName = identity.userInfo.nickName || '微信用户';
        app.recordActivityLog({
          type: 'system',
          title: '登录成功',
          summary: `${nickName} 登录了小程序`,
          icon: '🔐',
          color: '#667eea'
        });
        wx.showToast({ title: '登录成功', icon: 'success', duration: 1200 });
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1200);
      })
      .catch((error) => {
        const errorMessage = String(error.errMsg || error.message || '');
        let message = error.message || '登录服务不可用';
        if (errorMessage.includes('url not in domain list')) {
          message = '登录域名未加入微信合法域名';
        } else if (errorMessage.includes('request:fail')) {
          message = '网络连接失败，请检查网络';
        }
        wx.showToast({ title: message, icon: 'none', duration: 3000 });
      })
      .finally(() => this.setData({ loggingIn: false }));
  },

  getOptionalProfile() {
    return new Promise((resolve) => {
      if (typeof wx.getUserProfile !== 'function') {
        resolve({});
        return;
      }
      wx.getUserProfile({
        desc: '用于完善用户头像和昵称',
        success: (response) => resolve(response.userInfo || {}),
        fail: () => resolve({})
      });
    });
  },

  mockLogin() {
    const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
    wx.setStorageSync('token', 'debug_mock_token');
    wx.setStorageSync('openId', 'debug_mock_openid');
    wx.setStorageSync('userInfo', {
      avatarUrl: defaultAvatar,
      nickName: '微信用户'
    });
    wx.setStorageSync('need_profile_setup', true);
    app.recordActivityLog({
      type: 'system',
      title: '登录成功',
      summary: '微信用户 登录了小程序',
      icon: '🔐',
      color: '#667eea'
    });
    wx.showToast({ title: '免登录调试模式', icon: 'success', duration: 1000 });
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000);
  }
});
