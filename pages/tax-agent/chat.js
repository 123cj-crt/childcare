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
    scrollTo: 'welcome',
    sessionId: '',
    lastFailedMessage: '',
    requestError: '',
    sources: [],
    usage: null
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

  sendMessage(rawMessage, isRetry = false) {
    const message = (rawMessage || '').trim();
    if (!message || this.data.isLoading) {
      return;
    }

    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: message };
    this.setData({
      messages: isRetry ? this.data.messages : this.data.messages.concat(userMessage),
      inputMessage: '',
      isLoading: true,
      scrollTo: isRetry ? this.data.scrollTo : userMessage.id,
      requestError: ''
    });

    agentApi.sendChat({ message, sessionId: this.data.sessionId })
      .then((data) => {
        const agentMessage = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: data.answer
        };
        this.setData({
          messages: this.data.messages.concat(agentMessage),
          isLoading: false,
          scrollTo: agentMessage.id,
          sessionId: data.session_id,
          lastFailedMessage: '',
          requestError: '',
          sources: data.sources || [],
          usage: data.usage || null
        });
      })
      .catch((error) => {
        console.warn('[财税学习] 对话请求失败', error);
        this.setData({
          isLoading: false,
          lastFailedMessage: message,
          requestError: error.message || '小税暂时没有收到回答，请稍后重试。'
        });
      });
  },

  retryLastMessage() {
    if (this.data.lastFailedMessage && !this.data.isLoading) {
      this.sendMessage(this.data.lastFailedMessage, true);
    }
  },

  clearConversation() {
    this.setData({
      messages: [createWelcomeMessage()],
      inputMessage: '',
      isLoading: false,
      scrollTo: 'welcome',
      sessionId: '',
      lastFailedMessage: '',
      requestError: '',
      sources: [],
      usage: null
    });
  }
});
