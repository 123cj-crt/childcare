// webview.js
Page({
  data: {
    url: '',
    title: '微信公众号推文',
    loading: true,
    error: false,
    errorMsg: '',
    // 公众号文章等 web-view 无法加载的链接，提示用复制链接方式打开
    isWeChatArticle: false
  },

  onLoad(options) {
    console.log('webview页面加载，参数:', options);
    const { url, title } = options;
    if (url) {
      const decodedUrl = decodeURIComponent(url);
      const decodedTitle = title ? decodeURIComponent(title) : '微信公众号推文';
      console.log('解析后的URL:', decodedUrl);
      console.log('解析后的标题:', decodedTitle);

      // 公众号文章域名无法在小程序内 web-view 打开，直接给出复制链接卡片，不尝试加载
      const isWeChatArticle = decodedUrl.indexOf('mp.weixin.qq.com') !== -1 ||
        decodedUrl.indexOf('weixin.qq.com') !== -1;

      if (isWeChatArticle) {
        this.setData({
          url: decodedUrl,
          title: decodedTitle,
          isWeChatArticle: true,
          loading: false,
          error: true,
          errorMsg: '微信公众号文章无法在小程序内直接打开'
        });
      } else {
        this.setData({
          url: decodedUrl,
          title: decodedTitle,
          isWeChatArticle: false,
          loading: false
        });
      }
    } else {
      console.log('没有接收到URL参数');
      this.setData({
        error: true,
        loading: false,
        errorMsg: '未接收到文章链接'
      });
    }
  },

  onWebViewLoad() {
    this.setData({
      loading: false
    });
  },

  onWebViewError() {
    // 公众号文章等会因业务域名限制加载失败，给出复制链接提示
    const errorMsg = this.data.isWeChatArticle
      ? '微信公众号文章无法在小程序内直接打开'
      : '页面加载失败';
    this.setData({
      loading: false,
      error: true,
      errorMsg: errorMsg
    });
  },

  onMessage(e) {
    console.log('webview message:', e.detail);
  },

  copyLink() {
    const url = this.data.url;
    if (!url) return;
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: this.data.isWeChatArticle ? '链接已复制，请在微信中打开' : '链接已复制',
          icon: 'none',
          duration: 2500
        });
      }
    });
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
