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

  // [临时体验版 2026-08-12] 本地身份登录：不依赖后端 /api/wechat/login。
  // 为每台设备生成独立 openId，确保家长数据隔离；云开发的儿童/预约等仍按真实微信 OPENID 隔离，互不影响。
  // 8/15 前后端联调后，把 config.js 的 wechatLoginMode 改回 'wechat' 即可恢复真实登录。
  mockLogin() {
    let openId = wx.getStorageSync('openId')
    // 避免沿用旧的公共调试 openId，确保每位家长独立
    if (!openId || openId === 'debug_mock_openid') {
      openId = 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
      wx.setStorageSync('openId', openId)
    }
    // 本地登录令牌（体验版用，不依赖后端）
    wx.setStorageSync('token', 'exp_token_' + openId)

    const stored = wx.getStorageSync('userInfo') || {}
    if (!stored.avatarUrl) {
      wx.setStorageSync('userInfo', {
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        nickName: '微信用户'
      })
    }
    wx.setStorageSync('need_profile_setup', true)
    app.recordActivityLog({
      type: 'system',
      title: '登录成功',
      summary: '微信用户 登录了小程序',
      icon: '🔐',
      color: '#667eea'
    });
    wx.showToast({ title: '登录成功', icon: 'success', duration: 1000 });
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000);
  }
});
