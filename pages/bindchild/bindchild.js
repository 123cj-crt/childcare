// pages/bindchild/bindchild.js
const app = getApp()

// ========== 调试模式：没有服务器时用假数据 ==========
const DEBUG_MOCK_DATA = true
const MOCK_CHILDREN = [
  {
    id: 1,
    name: '小明',
    age: '3岁',
    gender: '男',
    relation: '爸爸',
    avatar: '/images/default-avatar.png',
    parentName: '张三',
    phoneNumber: '138****8888'
  },
  {
    id: 2,
    name: '小红',
    age: '2岁',
    gender: '女',
    relation: '妈妈',
    avatar: '/images/default-avatar.png',
    parentName: '李四',
    phoneNumber: '139****9999'
  }
]
// ======================================================

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
    if (DEBUG_MOCK_DATA) {
      this.setData({ children: MOCK_CHILDREN });
      return;
    }

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

  formatGender(gender) {
    if (gender === 0 || gender === '0' || gender === '男') return '男';
    if (gender === 1 || gender === '1' || gender === '女') return '女';
    return '未知';
  }
})
