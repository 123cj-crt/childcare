// pages/login/login.js
// === 调试模式：跳过微信登录和后端请求，一键模拟登录 ===
// 正式上线时，把 DEBUG_SKIP_LOGIN 改成 false，删掉 mockLogin 方法即可

const app = getApp()

// 调试开关：true = 跳过登录直接 mock，false = 走真实登录流程
const DEBUG_SKIP_LOGIN = true

Page({
  data: {
    agreeChecked: false
  },

  goToUserProtocol() {
    wx.navigateTo({
      url: '/pages/userPolicy/userPolicy'
    });
  },

  onAgreementChange(e) {
    this.setData({
      agreeChecked: e.detail.value.length > 0
    })
  },

  quickLogin() {
    if (!this.data.agreeChecked) {
      wx.showToast({ title: '请勾选协议后登录', icon: 'none' })
      return
    }

    // ========== 调试模式：mock 登录 ==========
    if (DEBUG_SKIP_LOGIN) {
      this.mockLogin()
      return
    }

    // ========== 正式版：真实登录流程（下方不要动） ==========
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        const { avatarUrl, nickName } = profileRes.userInfo;
        wx.login({
          success: (res) => {
            wx.request({
              url: `${app.globalData.API_BASE_URL}/api/wechat/login`,
              method: 'POST',
              data: { code: res.code, avatarUrl, nickName },
              success: (resp) => {
                if (resp.statusCode !== 200 || resp.data.code !== 200) {
                  wx.showToast({ title: resp.data.msg || '登录失败', icon: 'none' });
                  return;
                }
                const loginData = resp.data;
                if (typeof loginData.data === 'string') {
                  wx.setStorageSync('token', loginData.data);
                  wx.setStorageSync('openId', '');
                } else if (typeof loginData.data === 'object' && loginData.data !== null) {
                  wx.setStorageSync('token', loginData.data.token);
                  wx.setStorageSync('openId', loginData.data.openId || '');
                }
                wx.setStorageSync('userInfo', { avatarUrl, nickName });
                wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
                setTimeout(() => { wx.reLaunch({ url: '/pages/login-1/login-1' }) }, 1500);
              },
              fail: () => {
                wx.showToast({ title: '网络请求失败', icon: 'none' });
              }
            });
          },
          fail: () => {
            wx.showToast({ title: '微信登录失败，请重试', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.showModal({
          title: '需要授权',
          content: '需要获取您的头像和昵称信息',
          showCancel: true,
          cancelText: '暂不登录',
          confirmText: '继续登录',
          success: (modalRes) => {
            if (!modalRes.confirm) {
              wx.showToast({ title: '已取消登录', icon: 'none' });
            }
          }
        });
      }
    });
  },

  // ========== 调试用：mock 登录 ==========
  mockLogin() {
    // 写入 mock 用户数据
    wx.setStorageSync('token', 'debug_mock_token')
    wx.setStorageSync('openId', 'debug_mock_openid')
    wx.setStorageSync('userInfo', {
      avatarUrl: '/icon/my.png',
      nickName: '调试用户'
    })

    wx.showToast({ title: '免登录调试模式', icon: 'success', duration: 1000 })

    setTimeout(() => {
      // 直接跳到首页（tabBar 页面用 switchTab）
      wx.switchTab({ url: '/pages/index/index' })
    }, 1000)
  }
})
