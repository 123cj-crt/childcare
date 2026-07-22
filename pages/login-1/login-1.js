// pages/login-1/login-1.js
Page({
  goToLogin(){
    // 显示信息收集提示弹窗
    wx.showModal({
      title: '信息收集提示',
      content: '为了确认孩子预约课程信息，需要收集您的手机号和姓名等个人信息。您是否同意提供这些信息？',
      showCancel: true,
      cancelText: '拒绝',
      confirmText: '接受',
      success: (res) => {
        if (res.confirm) {
          // 用户接受，跳转到绑定页面
          wx.redirectTo({
            url: '/pages/login-2/login-2'
          });
        } else {
          // 用户拒绝，显示提示
          wx.showToast({
            title: '已取消绑定',
            icon: 'none'
          });
        }
      }
    });
  },

  skipBinding(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})