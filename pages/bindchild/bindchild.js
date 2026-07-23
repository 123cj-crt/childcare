const { request } = require('../../utils/request');

Page({
  data: {
    children: []
  },

  onLoad() {
    this.getChildrenList();
  },

  onShow() {
    this.getChildrenList();
  },

  getChildrenList() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    request({
      path: '/api/child/list',
      header: {
        Authorization: `Bearer ${token}`,
        'X-WX-OPENID': 'oNI9IvqVGH2tVpkxGboMLN_SiAA8'
      }
    })
      .then((response) => {
        if (!response.data || response.data.code !== 200) {
          throw { type: 'business', path: '/api/child/list', data: response.data };
        }

        this.setData({
          children: (response.data.data || []).map((child) => ({
            id: child.id,
            name: child.childName,
            age: `${child.age}岁`,
            gender: child.gender === 0 ? '男' : '女',
            relation: child.relationship,
            avatar: child.avatar || '/icon/my.png',
            parentName: child.parentName || '未设置',
            phoneNumber: child.phoneNumber
          }))
        });
      })
      .catch((error) => {
        console.error('[孩子列表] 请求失败。', error);
        wx.showToast({ title: '获取孩子列表失败', icon: 'none' });
      });
  }
});
