const agentApi = require('../../services/agent-api');

Page({
  data: {
    recommendedQuestions: [],
    isLoading: true,
    isReady: false,
    errorMessage: ''
  },

  onLoad() {
    agentApi.getAgentHome().then((data) => {
      this.setData({ recommendedQuestions: data.recommendedQuestions || [] });
    });

    agentApi.initializeAgent()
      .then(() => {
        this.setData({ isLoading: false, isReady: true, errorMessage: '' });
      })
      .catch((error) => {
        console.warn('[财税学习] 服务初始化失败', error);
        this.setData({
          isLoading: false,
          isReady: false,
          errorMessage: error.message || '智能体服务暂时不可用'
        });
        wx.showToast({ title: '请检查本地 FastAPI 服务', icon: 'none' });
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

  askRecommendedQuestion(event) {
    if (!this.data.isReady) {
      wx.showToast({ title: this.data.errorMessage || '服务正在准备中', icon: 'none' });
      return;
    }
    const { question } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/tax-agent/chat?question=${encodeURIComponent(question)}`
    });
  },

  retryInitialize() {
    this.setData({ isLoading: true, errorMessage: '' });
    agentApi.initializeAgent()
      .then(() => this.setData({ isLoading: false, isReady: true }))
      .catch((error) => this.setData({
        isLoading: false,
        isReady: false,
        errorMessage: error.message || '智能体服务暂时不可用'
      }));
  }
});
