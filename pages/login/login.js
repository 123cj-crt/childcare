// pages/login/login.js
// === 调试模式：跳过微信登录和后端请求，一键模拟登录 ===
// 正式上线时，把 DEBUG_SKIP_LOGIN 改成 false，删掉 mockLogin 方法即可

const app = getApp()

// 调试开关：true = 跳过登录直接 mock，false = 走真实登录流程
// ⚠️ 后端域名 gdufe-childcare.cn 未备案 + HTTP 协议，真机预览强制校验合法域名
// 当前必须保持 true，等同事后端就绪（备案+HTTPS+配置合法域名）后才能改回 false
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
                console.log('===== 登录接口返回 =====', resp);
                if (resp.statusCode !== 200 || resp.data.code !== 200) {
                  wx.showToast({ title: resp.data.msg || '登录失败', icon: 'none' });
                  return;
                }
                const loginData = resp.data;
                let savedToken = '';
                let savedOpenId = '';

                // 后端返回结构可能是以下几种：
                // 1. loginData.data = "{\"openid\":\"xxx\"}"  （JSON 字符串，本项目实际这样）
                // 2. loginData.data = { token: "xxx", openId: "yyy" }
                // 3. loginData.data = "纯token字符串"
                const rawData = loginData.data;

                if (typeof rawData === 'string') {
                  // 尝试解析 JSON 字符串（项目里登录接口实际就这样）
                  try {
                    const parsed = JSON.parse(rawData);
                    savedOpenId = parsed.openid || parsed.openId || parsed.open_id || '';
                    savedToken = parsed.token || parsed.accessToken || parsed.access_token || savedOpenId;
                    console.log('✅ data 是 JSON 字符串，解析成功');
                  } catch (e) {
                    // 解析失败说明是纯 token 字符串
                    savedToken = rawData;
                    console.log('⚠️ data 是纯字符串（不是 JSON）');
                  }
                } else if (typeof rawData === 'object' && rawData !== null) {
                  savedToken = rawData.token || rawData.accessToken || rawData.access_token || '';
                  savedOpenId = rawData.openId || rawData.openid || rawData.open_id || '';
                }

                console.log('解析得到 token:', savedToken ? '✅ 有值' : '❌ 空值');
                console.log('解析得到 openId:', savedOpenId ? `✅ ${savedOpenId.substring(0, 10)}...` : '❌ 空值');

                if (!savedOpenId) {
                  console.error('⚠️ 后端没有返回 openid！完整返回:', loginData);
                  wx.showToast({ title: '登录异常：未获取到身份', icon: 'none' });
                  return;
                }

                // 没有独立 token 时，用 openid 兜底（项目里 API 只校验 X-WX-OPENID）
                if (!savedToken) savedToken = savedOpenId;

                wx.setStorageSync('token', savedToken);
                wx.setStorageSync('openId', savedOpenId);
                wx.setStorageSync('userInfo', { avatarUrl, nickName });

                // 记录登录活动日志（系统通知）
                app.recordActivityLog({
                  type: 'system',
                  title: '登录成功',
                  summary: `${nickName || '用户'} 登录了小程序`,
                  icon: '🔐',
                  color: '#667eea'
                });

                wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
                setTimeout(() => { wx.switchTab({ url: '/pages/index/index' }) }, 1500);
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
