// test-image.js
const app = getApp();

Page({
  data: {
    testImages: [
      {
        name: '默认图片1',
        url: '/images/1.jpg'
      },
      {
        name: '默认图片2', 
        url: '/images/2.jpg'
      },
      {
        name: '默认图片3',
        url: '/images/3.jpg'
      },
      {
        name: '上传图片测试',
        url: app.globalData.API_BASE_URL + '/uploads/images/test.jpg'
      }
    ]
  },

  onLoad() {
    console.log('测试页面加载');
    console.log('API基础URL:', app.globalData.API_BASE_URL);
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    console.log('图片加载失败:', this.data.testImages[index]);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
  },

  testApiConnection() {
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/tweets`,
      method: 'GET',
      success: (res) => {
        console.log('API连接测试成功:', res.data);
        wx.showModal({
          title: 'API连接测试',
          content: '连接成功！数据: ' + JSON.stringify(res.data),
          showCancel: false
        });
      },
      fail: (error) => {
        console.error('API连接测试失败:', error);
        wx.showModal({
          title: 'API连接测试',
          content: '连接失败: ' + error.errMsg,
          showCancel: false
        });
      }
    });
  }
});
