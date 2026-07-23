const agentApi = require('../../services/agent-api');

function createWelcomeMessage() {
  return {
    id: 'welcome',
    role: 'agent',
    content: '你好！我是小税。你可以问我税收、发票、公共设施或零花钱的小问题。'
  };
}

Page({
  data: {
    messages: [createWelcomeMessage()],
    recommendedQuestions: [],
    inputMessage: '',
    isLoading: false,
    scrollTo: 'welcome'
  },

  onLoad(options) {
    agentApi.getAgentHome().then((data) => {
      this.setData({ recommendedQuestions: data.recommendedQuestions || [] });
    }).catch((error) => console.warn('[财税学习] 推荐问题加载失败', error));

    if (options.question) {
      this.sendMessage(decodeURIComponent(options.question));
    }
  },

  onInput(event) {
    this.setData({ inputMessage: event.detail.value });
  },

  askRecommendedQuestion(event) {
    this.sendMessage(event.currentTarget.dataset.question);
  },

  sendFromInput() {
    this.sendMessage(this.data.inputMessage);
  },

  sendMessage(rawMessage) {
    const message = (rawMessage || '').trim();
    if (!message || this.data.isLoading) {
      return;
    }

    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: message };
    this.setData({
      messages: this.data.messages.concat(userMessage),
      inputMessage: '',
      isLoading: true,
      scrollTo: userMessage.id
    });

    agentApi.sendChatMessage(message)
      .then((data) => {
        const agentMessage = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: data.answer || '小税正在整理这个问题的答案。'
        };
        this.setData({
          messages: this.data.messages.concat(agentMessage),
          isLoading: false,
          scrollTo: agentMessage.id
        });
      })
      .catch((error) => {
        console.warn('[财税学习] 对话请求失败', error);
        const agentMessage = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: '小税暂时没有收到回答，请稍后再试。'
        };
        this.setData({
          messages: this.data.messages.concat(agentMessage),
          isLoading: false,
          scrollTo: agentMessage.id
        });
      });
  },

  clearConversation() {
    this.setData({
      messages: [createWelcomeMessage()],
      inputMessage: '',
      isLoading: false,
      scrollTo: 'welcome'
    });
  }
});
