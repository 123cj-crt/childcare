const { API_BASE_URL, request } = require('../../utils/request');

Page({
  data: {
    testImages: [
      { name: '默认图片1', url: '/images/1.jpg' },
      { name: '默认图片2', url: '/images/2.jpg' },
      { name: '默认图片3', url: '/images/3.jpg' },
      { name: '上传图片测试', url: `${API_BASE_URL}/uploads/images/test.jpg` }
    ]
  },

  onLoad() {
    console.log('测试页面加载，API 基础地址：', API_BASE_URL);
  },

  onImageError(e) {
    console.warn('图片加载失败：', this.data.testImages[e.currentTarget.dataset.index]);
    wx.showToast({ title: '图片加载失败', icon: 'none' });
  },

  testApiConnection() {
    request({ path: '/api/tweets' })
      .then((response) => wx.showModal({
        title: 'API 连接测试',
        content: `连接成功：${JSON.stringify(response.data)}`,
        showCancel: false
      }))
      .catch((error) => wx.showModal({
        title: 'API 连接测试',
        content: `连接失败：${error.statusCode || error.errMsg || '未知错误'}`,
        showCancel: false
      }));
  }
});
