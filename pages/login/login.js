// pages/login/login.js
Page({
  data: {
    agreeChecked: false
  },
  //查看协议
  goToUserProtocol() {
    wx.navigateTo({
      url: '/pages/userPolicy/userPolicy'
    });
  },
  onAgreementChange(e) {
    // 判断是否勾选了 checkbox
    this.setData({
      agreeChecked: e.detail.value.length > 0
    })
  },
  //登录逻辑
  quickLogin() {
    if (!this.data.agreeChecked) {
      wx.showToast({
        title: '请勾选协议后登录',
        icon: 'none'
      })
      return
    }

    // 先获取用户信息，再获取code
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        const { avatarUrl, nickName } = profileRes.userInfo;
        
        // 获取用户信息成功后，再获取code
        wx.login({
          success: (res) => {
            const code = res.code;
            
            wx.request({
              url: 'http://localhost:8080/api/wechat/login',
              method: 'POST',
              data: {
                code: code,
                avatarUrl: avatarUrl,
                nickName: nickName
              },
              success: (resp) => {
                console.log('wx.request success response:', resp);
                try {
                  const loginData = resp.data;
                  wx.setStorageSync('token', loginData.data);
                  wx.setStorageSync('userInfo', {
                    avatarUrl: avatarUrl,
                    nickName: nickName
                  });
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success',
                    duration: 1500
                  });
                  setTimeout(() => {
                    wx.reLaunch({ url: '/pages/login-1/login-1' });
                  }, 1500);
                } catch (e) {
                  console.error('Error parsing JSON or processing login data:', e);
                  wx.showToast({
                    title: '登录数据处理失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('wx.request fail:', err);
                wx.showToast({
                  title: '网络请求失败',
                  icon: 'none'
                });
              },
              complete: (res) => {
                console.log('wx.request complete:', res);
              }
            });
          },
          fail: (loginErr) => {
            console.error('微信登录失败:', loginErr);
            wx.showToast({
              title: '微信登录失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: (profileErr) => {
        console.error('获取用户信息失败:', profileErr);
        wx.showModal({
          title: '需要授权',
          content: '为了提供更好的服务，需要获取您的头像和昵称信息。这些信息仅用于完善您的个人资料，不会用于其他用途。',
          showCancel: true,
          cancelText: '暂不登录',
          confirmText: '继续登录',
          success: (modalRes) => {
            if (modalRes.confirm) {
              // 用户选择继续登录，可以再次调用登录
              console.log('用户选择继续登录');
              // 可以在这里添加重新授权的逻辑，比如再次调用quickLogin
            } else {
              console.log('用户取消授权');
              wx.showToast({
                title: '已取消登录',
                icon: 'none'
              });
            }
          }
        });
      }
    });
  }

})
