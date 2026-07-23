const { request } = require('../../utils/request');

Page({
  data: {
    agreeChecked: false
  },

  goToUserProtocol() {
    wx.navigateTo({ url: '/pages/userPolicy/userPolicy' });
  },

  onAgreementChange(e) {
    this.setData({ agreeChecked: e.detail.value.length > 0 });
  },

  quickLogin() {
    if (!this.data.agreeChecked) {
      wx.showToast({ title: '请勾选协议后登录', icon: 'none' });
      return;
    }

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileResponse) => {
        const { avatarUrl, nickName } = profileResponse.userInfo;
        wx.login({
          success: (loginResponse) => {
            request({
              path: '/api/wechat/login',
              method: 'POST',
              data: { code: loginResponse.code, avatarUrl, nickName }
            })
              .then((response) => {
                const loginData = response.data;
                if (!loginData || !loginData.data) {
                  throw { type: 'business', path: '/api/wechat/login', data: loginData };
                }

                wx.setStorageSync('token', loginData.data);
                wx.setStorageSync('userInfo', { avatarUrl, nickName });
                wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
                setTimeout(() => wx.reLaunch({ url: '/pages/login-1/login-1' }), 1500);
              })
              .catch((error) => {
                console.error('[登录] 后端登录请求失败。', error);
                wx.showToast({ title: '登录服务不可用，请稍后重试', icon: 'none' });
              });
          },
          fail: (error) => {
            console.error('[登录] 微信登录失败。', error);
            wx.showToast({ title: '微信登录失败，请重试', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.showModal({
          title: '需要授权',
          content: '登录需要获取头像和昵称信息。',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  }
});
