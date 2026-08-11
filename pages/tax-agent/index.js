const agentApi = require('../../services/agent-api');
const { redirectToLoginAfterAuthenticationFailure } = require('../../services/wechat-auth');

Page({
  data: {
    isLoading: true,
    isReady: false,
    errorMessage: ''
  },

  onLoad() {
    agentApi.initializeAgent()
      .then(() => {
        this.setData({ isLoading: false, isReady: true, errorMessage: '' });
      })
      .catch((error) => {
        if (error && error.type === 'authentication') {
          redirectToLoginAfterAuthenticationFailure();
          return;
        }
        console.warn('[财税学习] 服务初始化失败', error);
        this.setData({
          isLoading: false,
          isReady: false,
          errorMessage: error.message || '智能体服务暂时不可用'
        });
        wx.showToast({ title: '财税智能体服务暂时不可用', icon: 'none' });
      });
  },

  goToFeature(event) {
    if (!this.data.isReady) {
      wx.showToast({ title: this.data.errorMessage || '服务正在准备中', icon: 'none' });
      return;
    }
    const { path } = event.currentTarget.dataset;
    wx.navigateTo({ url: path });
  },

  retryInitialize() {
    this.setData({ isLoading: true, errorMessage: '' });
    agentApi.initializeAgent()
      .then(() => this.setData({ isLoading: false, isReady: true }))
      .catch((error) => {
        if (error && error.type === 'authentication') {
          redirectToLoginAfterAuthenticationFailure();
          return;
        }
        this.setData({
          isLoading: false,
          isReady: false,
          errorMessage: error.message || '智能体服务暂时不可用'
        });
      });
  }
});
