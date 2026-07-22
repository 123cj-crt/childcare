// webview.js
Page({
  data: {
    url: '',
    title: '微信公众号推文',
    loading: true,
    error: false
  },

  onLoad(options) {
    console.log('webview页面加载，参数:', options);
    const { url, title } = options;
    if (url) {
      const decodedUrl = decodeURIComponent(url);
      const decodedTitle = title ? decodeURIComponent(title) : '微信公众号推文';
      console.log('解析后的URL:', decodedUrl);
      console.log('解析后的标题:', decodedTitle);
      
      this.setData({
        url: decodedUrl,
        title: decodedTitle,
        loading: false
      });
    } else {
      console.log('没有接收到URL参数');
      this.setData({
        error: true,
        loading: false
      });
    }
  },

  onWebViewLoad() {
    this.setData({
      loading: false
    });
  },

  onWebViewError() {
    this.setData({
      loading: false,
      error: true
    });
  },

  onMessage(e) {
    console.log('webview message:', e.detail);
  },

  goBack() {
    wx.navigateBack();
  },

  retry() {
    this.setData({
      loading: true,
      error: false
    });
    // 重新加载页面
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    currentPage.onLoad(currentPage.options);
  }
});
