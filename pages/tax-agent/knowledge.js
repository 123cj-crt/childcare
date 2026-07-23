const agentApi = require('../../services/agent-api');

Page({
  data: {
    cards: [],
    activeCardId: '',
    isLoading: true
  },

  onLoad() {
    agentApi.getKnowledgeCards()
      .then((cards) => this.setData({ cards: cards || [], isLoading: false }))
      .catch((error) => {
        console.warn('[财税学习] 知识卡片加载失败', error);
        this.setData({ isLoading: false });
        wx.showToast({ title: '知识卡片暂时不可用', icon: 'none' });
      });
  },

  toggleCard(event) {
    const { id } = event.currentTarget.dataset;
    this.setData({ activeCardId: this.data.activeCardId === id ? '' : id });
  }
});
