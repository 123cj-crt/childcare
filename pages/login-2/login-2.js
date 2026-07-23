// pages/login-2/login-2.js
const app = getApp()

Page({
  data: {
    childName: '',
    age: '',
    gender: '',
    relationship: '',
    parentName: '',
    phoneNumber: ''
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  // 表单校验
  validateForm() {
    const { childName, age, gender, relationship, parentName, phoneNumber } = this.data;
    if (!childName.trim()) {
      wx.showToast({ title: '请输入孩子姓名', icon: 'none' });
      return false;
    }
    if (!age || isNaN(age) || parseInt(age) <= 0) {
      wx.showToast({ title: '请输入有效年龄', icon: 'none' });
      return false;
    }
    if (!gender.trim()) {
      wx.showToast({ title: '请输入性别', icon: 'none' });
      return false;
    }
    if (!relationship.trim()) {
      wx.showToast({ title: '请输入关系', icon: 'none' });
      return false;
    }
    if (!parentName.trim()) {
      wx.showToast({ title: '请输入家长姓名', icon: 'none' });
      return false;
    }
    if (!phoneNumber.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }
    return true;
  },

  // 统一绑定请求
  bindChild(callback) {
    if (!this.validateForm()) return;

    const openId = wx.getStorageSync('openId');

    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/child/bind`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      data: {
        childName: this.data.childName,
        age: parseInt(this.data.age),
        gender: this.data.gender,
        relationship: this.data.relationship,
        parentName: this.data.parentName,
        phoneNumber: this.data.phoneNumber
      },
      success: (res) => {
        console.log('绑定接口返回:', res.data);

        if (res.statusCode !== 200 || res.data.code !== 200) {
          wx.showToast({
            title: res.data.msg || '绑定失败',
            icon: 'none'
          });
          return;
        }

        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 1500
        });

        // 清空表单
        this.setData({
          childName: '',
          age: '',
          gender: '',
          relationship: '',
          parentName: '',
          phoneNumber: ''
        });

        // 执行回调（跳转页面等）
        if (callback) callback();
      },
      fail: (err) => {
        console.error('绑定失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 仅保存，不跳转
  goToIndex() {
    this.bindChild(null);
  },

  // 保存并跳转首页
  confirmAndGoHome() {
    this.bindChild(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    });
  }

})
