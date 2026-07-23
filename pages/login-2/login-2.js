const { request } = require('../../utils/request');

Page({
  data: {
    childName: '',
    age: '',
    gender: '',
    relationship: '',
    parentName: '',
    phoneNumber: '',
    parentOpenId: 'oNI9IvqVGH2tVpkxGboMLN_SiAA8'
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },

  goToIndex() {
    this.submitChild(false);
  },

  confirmAndGoHome() {
    this.submitChild(true);
  },

  submitChild(shouldGoHome) {
    request({
      path: '/api/child/bind',
      method: 'POST',
      header: { 'X-WX-OPENID': this.data.parentOpenId },
      data: {
        childName: this.data.childName,
        age: parseInt(this.data.age, 10),
        gender: this.data.gender,
        relationship: this.data.relationship,
        parentName: this.data.parentName,
        phoneNumber: this.data.phoneNumber,
        parentOpenId: this.data.parentOpenId
      }
    })
      .then((response) => {
        if (!response.data || response.data.code !== 200) {
          throw { type: 'business', path: '/api/child/bind', data: response.data };
        }

        this.setData({
          childName: '',
          age: '',
          gender: '',
          relationship: '',
          parentName: '',
          phoneNumber: ''
        });
        wx.showToast({ title: '添加成功', icon: 'success', duration: 1500 });
        if (shouldGoHome) {
          setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1500);
        }
      })
      .catch((error) => {
        console.error('[绑定儿童] 保存失败。', error);
        wx.showToast({ title: '儿童信息保存失败', icon: 'none', duration: 2000 });
      });
  }
});
