// pages/bindchild/bindchild.js
const app = getApp()

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
    // 注意：存储 key 是 openId（大写D），不是 openid
    const openId = wx.getStorageSync('openId');
    const token = wx.getStorageSync('token');

    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/child/list`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        // child/list 返回 R<> 格式
        if (res.statusCode === 200 && res.data.code === 200) {
          this.setData({
            children: (res.data.data || []).map(child => ({
              id: child.id,
              name: child.childName,
              age: child.age + '岁',
              gender: this.formatGender(child.gender),
              relation: child.relationship,
              avatar: '/images/default-avatar.png',
              parentName: child.parentName || '未设置',
              phoneNumber: child.phoneNumber
            }))
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取孩子列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求孩子列表失败', err);
        wx.showToast({ title: '网络错误，获取孩子列表失败', icon: 'none' });
      }
    });
  },

  // 兼容后端 gender 字段可能是数字或字符串
  formatGender(gender) {
    if (gender === 0 || gender === '0' || gender === '男') return '男';
    if (gender === 1 || gender === '1' || gender === '女') return '女';
    return '未知';
  }
})
