// pages/login/login.js
// === 调试模式：跳过微信登录和后端请求，一键模拟登录 ===
// 正式上线时，把 DEBUG_SKIP_LOGIN 改成 false，删掉 mockLogin 方法即可

const app = getApp()
const { loginWithWechat } = require('../../services/wechat-auth')

// 调试开关：true = 跳过登录直接 mock，false = 走真实登录流程
// ✅ 后端域名 gdufe-childcare.cn 已备案，开发者工具中可走真实登录
// ⚠️ 真机预览仍需 HTTPS + 小程序后台配置合法域名
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

    // ========== 正式版：微信登录后同时取得财税智能体身份 ==========
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        const { avatarUrl, nickName } = profileRes.userInfo
        loginWithWechat({ avatarUrl, nickName })
          .then(() => {
            app.recordActivityLog({
              type: 'system',
              title: '登录成功',
              summary: `${nickName || '用户'} 登录了小程序`,
              icon: '🔐',
              color: '#667eea'
            })
            wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
            setTimeout(() => { wx.switchTab({ url: '/pages/index/index' }) }, 1500)
          })
          .catch((error) => {
            console.error('===== 登录请求失败 =====', error)
            const errorMessage = String(error.errMsg || error.message || '')
            let message = error.message || '登录服务不可用'
            if (errorMessage.includes('url not in domain list')) {
              message = '域名未加入合法域名列表，请检查配置'
            } else if (errorMessage.includes('request:fail')) {
              message = '网络连接失败，请检查网络'
            }
            wx.showToast({ title: message, icon: 'none', duration: 3000 })
          })
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
    // 微信官方默认头像（未设置头像前显示灰色人形）
    const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    wx.setStorageSync('token', 'debug_mock_token')
    wx.setStorageSync('openId', 'debug_mock_openid')
    wx.setStorageSync('userInfo', {
      avatarUrl: defaultAvatar,
      nickName: '微信用户'
    })
    // 标记需要完善资料，profile 页面会据此自动弹出编辑窗
    wx.setStorageSync('need_profile_setup', true)

    // 记录登录活动日志（系统通知）
    app.recordActivityLog({
      type: 'system',
      title: '登录成功',
      summary: '微信用户 登录了小程序',
      icon: '🔐',
      color: '#667eea'
    })

    wx.showToast({ title: '免登录调试模式', icon: 'success', duration: 1000 })

    setTimeout(() => {
      // 直接跳到首页（tabBar 页面用 switchTab）
      wx.switchTab({ url: '/pages/index/index' })
    }, 1000)
  }
})
