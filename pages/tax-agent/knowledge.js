const agentApi = require('../../services/agent-api');

Page({
  data: {
    cards: [],
    activeCardId: '',
    isLoading: true
  },

  onLoad() {
    agentApi.getKnowledgeCards()
      .then((cards) => this.setData({
        cards: (cards || []).map((card) => ({
          ...card,
          icon: (card.category || '知').slice(0, 1),
          imageUrl: card.image_url || '/icon/book.png',
          detail: card.detail || `分类：${card.category || '财税小知识'}`
        })),
        isLoading: false
      }))
      .catch((error) => {
        console.warn('[财税学习] 知识卡片加载失败', error);
        this.setData({ isLoading: false });
        wx.showToast({ title: '知识卡片暂时不可用', icon: 'none' });
      });
  },

  toggleCard(event) {
    const { id } = event.currentTarget.dataset;
    this.setData({ activeCardId: this.data.activeCardId === id ? '' : id });
  },

  usePlaceholder(event) {
    const { id } = event.currentTarget.dataset;
    const cards = this.data.cards.map((card) => (
      card.id === id ? { ...card, imageUrl: '/icon/book.png' } : card
    ));
    this.setData({ cards });
  }
});
