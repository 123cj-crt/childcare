// app.js
App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'cloud1-2gxcddy05981d85a'
    })
    // 小程序启动时执行的逻辑
    console.log('小程序启动了')

    // 检查登录状态，如果没登录则跳转登录页
    const token = wx.getStorageSync('token')
    if (!token) {
      // 可以根据实际需求决定是否自动跳转
      console.log('未登录')
    }
  },
  globalData: {
    // 全局数据
    userInfo: null,
    API_BASE_URL: 'http://119.29.254.108:8080', // 已改为真实服务器地址
    notifications: [] // 用于存储通知的数组
  },

  // 添加通知的方法
  addNotification: function (courseName) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();
    const notification = {
      id: this.globalData.notifications.length + 1,
      courseName: courseName,
      time: `${date} ${time}`
    };
    this.globalData.notifications.push(notification);
    console.log('Notification added:', notification);

    // 将最新通知存储到本地缓存
    let storedNotifications = wx.getStorageSync('notifications') || [];
    storedNotifications.unshift(notification);
    wx.setStorageSync('notifications', storedNotifications);
  }
})
