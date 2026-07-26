// app.js
App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'cloud1-2gxcddy05981d85a'
    })
    // 小程序启动时执行的逻辑
    console.log('小程序启动了')
  },
  globalData: {
    // 全局数据
    userInfo: null,
    notifications: [], // 用于存储通知的数组
    // 仅在本次小程序运行期间保存财税聊天，避免将儿童对话写入本地持久化存储。
    taxAgentChat: null
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
