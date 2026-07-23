const agentApi = require('../../services/agent-api');

Page({
  data: {
    recommendedQuestions: [],
    isLoading: true
  },

  onLoad() {
    agentApi.getAgentHome()
      .then((data) => {
        this.setData({
          recommendedQuestions: data.recommendedQuestions || [],
          isLoading: false
        });
      })
      .catch((error) => {
        console.warn('[财税学习] 首页数据加载失败', error);
        this.setData({ isLoading: false });
        wx.showToast({ title: '学习内容暂时不可用', icon: 'none' });
      });
  },

  goToFeature(event) {
    const { path } = event.currentTarget.dataset;
    wx.navigateTo({ url: path });
  },

  askRecommendedQuestion(event) {
    const { question } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/tax-agent/chat?question=${encodeURIComponent(question)}`
    });
  }
});
