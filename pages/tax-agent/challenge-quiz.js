const agentApi = require('../../services/agent-api');
const TOPICS = { tax: { title: '税收与公共服务', count: 4 }, invoice: { title: '发票小知识', count: 3 }, budget: { title: '零花钱与预算', count: 5 } };

Page({
  data: { topic: null, topicCode: '', sessionId: '', currentIndex: 0, currentQuestion: null, nextQuestion: null, selectedOptionKey: '', answered: false, isCorrect: false, explanation: '', score: 0, complete: false, isLoading: true, isSubmitting: false, errorMessage: '' },
  onLoad(options) { const topic = TOPICS[options.topic]; if (topic) { this.setData({ topic, topicCode: options.topic }); this.startQuiz(); } else wx.navigateBack(); },
  startQuiz() {
    const { topic } = this.data; if (!topic) return;
    this.setData({ sessionId: '', currentIndex: 0, currentQuestion: null, nextQuestion: null, selectedOptionKey: '', answered: false, isCorrect: false, explanation: '', score: 0, complete: false, isLoading: true, isSubmitting: false, errorMessage: '' });
    agentApi.createQuizSession({ topic: this.data.topicCode, difficulty: 1, targetQuestionCount: topic.count }).then((session) => this.setData({ sessionId: session.session_id, currentQuestion: session.question, complete: session.session_status === 'completed', isLoading: false, errorMessage: session.question ? '' : '题目正在准备中。' })).catch((error) => this.setData({ isLoading: false, errorMessage: error.message || '题目暂时不可用，请稍后再试。' }));
  },
  selectOption(event) { if (!this.data.answered && !this.data.isSubmitting) this.setData({ selectedOptionKey: event.currentTarget.dataset.optionKey }); },
  checkAnswer() {
    const { currentQuestion, selectedOptionKey, sessionId, answered, isSubmitting } = this.data; if (answered || isSubmitting) return;
    if (!selectedOptionKey || !currentQuestion) return wx.showToast({ title: '先选一个答案吧', icon: 'none' });
    this.setData({ isSubmitting: true, errorMessage: '' });
    agentApi.submitQuizAnswer({ sessionId, questionId: currentQuestion.id, answer: selectedOptionKey }).then((result) => this.setData({ answered: true, isCorrect: Boolean(result.correct), explanation: result.explanation || '认真想一想，你会越来越棒。', score: result.score || 0, nextQuestion: result.next_question || null, complete: result.session_status === 'completed' && !result.next_question, isSubmitting: false })).catch((error) => this.setData({ isSubmitting: false, errorMessage: error.message || '答案提交失败，请重试。' }));
  },
  nextQuestion() { if (!this.data.nextQuestion) return this.setData({ complete: true }); this.setData({ currentIndex: this.data.currentIndex + 1, currentQuestion: this.data.nextQuestion, nextQuestion: null, selectedOptionKey: '', answered: false, isCorrect: false, explanation: '', errorMessage: '' }); },
  retrySubmit() { if (!this.data.isSubmitting) this.checkAnswer(); },
  chooseAnotherTopic() { wx.navigateBack(); }
});
