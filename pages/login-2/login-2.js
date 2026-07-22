// pages/login-2/login-2.js
Page({
  data: {
    childName: '',
    age: '',
    gender: '',
    relationship: '',
    parentName: '',
    phoneNumber: '',
    parentOpenId: 'oNI9IvqVGH2tVpkxGboMLN_SiAA8' // Assuming parentOpenId is static for now
  },
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },
  goToIndex(){
    wx.request({
      url: 'http://localhost:8080/api/child/bind', // 后端接口地址
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': this.data.parentOpenId
      },
      data: {
        childName: this.data.childName,
        age: parseInt(this.data.age), // 确保年龄是数字
        gender: this.data.gender,
        relationship: this.data.relationship,
        parentName: this.data.parentName,
        phoneNumber: this.data.phoneNumber,
        parentOpenId: this.data.parentOpenId
      },
      success: (res) => {
        console.log('绑定成功', res.data);
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1500
        });
        console.log('准备清空表单字段');
        this.setData({
          childName: '',
          age: '',
          gender: '',
          relationship: '',
          parentName: '',
          phoneNumber: ''
        });
        // 移除页面跳转逻辑
        // wx.switchTab({
        //   url: '/pages/index/index'
        // });
      },
      fail: (err) => {
        console.error('绑定失败', err);
        wx.showToast({
          title: '添加失败',
          icon: 'none',
          duration: 2000
        });
        console.error('详细错误信息:', err);
      }
    });
  },

  confirmAndGoHome() {
    wx.request({
      url: 'http://localhost:8080/api/child/bind', // 后端接口地址
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': this.data.parentOpenId
      },
      data: {
        childName: this.data.childName,
        age: parseInt(this.data.age), // 确保年龄是数字
        gender: this.data.gender,
        relationship: this.data.relationship,
        parentName: this.data.parentName,
        phoneNumber: this.data.phoneNumber,
        parentOpenId: this.data.parentOpenId
      },
      success: (res) => {
        console.log('绑定成功', res.data);
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1500
        });
        console.log('准备清空表单字段');
        this.setData({
          childName: '',
          age: '',
          gender: '',
          relationship: '',
          parentName: '',
          phoneNumber: ''
        });
        wx.switchTab({
          url: '/pages/index/index'
        });
      },
      fail: (err) => {
        console.error('绑定失败', err);
        wx.showToast({
          title: '添加失败',
          icon: 'none',
          duration: 2000
        });
        console.error('详细错误信息:', err);
      }
    });
  }

})