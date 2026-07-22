// pages/bindchild/bindchild.js
Page({
  data: {
    children: []
  },

  onLoad: function () {
    this.getChildrenList();
  },

  onShow: function () {
    this.getChildrenList();
  },

  getChildrenList: function () {
    const openid = wx.getStorageSync('openid');
    const token = wx.getStorageSync('token');

    if (!token) {
      console.error('Token not found in storage.');
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.request({
          url: 'http://localhost:8080/api/child/list',
          method: 'GET',
          header: {
          'Authorization': 'Bearer ' + token,
          'X-WX-OPENID': 'oNI9IvqVGH2tVpkxGboMLN_SiAA8'
        },
      success: (res) => {
        console.log('API /api/child/list success response:', res);
        if (res.statusCode === 200 && res.data.code === 200) {
          this.setData({
            children: res.data.data.map(child => ({
            id: child.id,
            name: child.childName,
            age: child.age + '岁',
            gender: child.gender === 0 ? '男' : '女',
            relation: child.relationship,
            avatar: child.avatar || '/images/default-avatar.png',
            parentName: child.parentName || '未设置',
            phoneNumber: child.phoneNumber
          }))
          });
          console.log('Children data updated:', this.data.children);
        } else {
          console.error('API /api/child/list returned error:', res.data);
          wx.showToast({
            title: res.data.msg || '获取孩子列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求孩子列表失败', err);
        wx.showToast({
          title: '网络错误，获取孩子列表失败',
          icon: 'none'
        });
      },
      complete: (res) => {
        console.log('wx.request to /api/child/list complete:', res);
      }
    });
  }
});
