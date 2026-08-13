const agentApi = require('../../services/agent-api');
const TOPICS = {
  'personal-income-tax': { title: '个人所得税', count: 10 },
  'resource-tax': { title: '资源税', count: 10 },
  'life-tax-fees': { title: '生活中的税费', count: 10 },
  'public-service': { title: '税收与公共服务', count: 10 },
  invoice: { title: '发票大揭秘', count: 10 }
};

function returnToChallengeTopics() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages.length > 1) {
    wx.navigateBack();
    return;
  }
  wx.redirectTo({ url: '/pages/tax-agent/challenge' });
}

Page({
  data: { topic: null, topicCode: '', sessionId: '', currentIndex: 0, currentQuestion: null, nextQuestion: null, selectedOptionKey: '', answered: false, isCorrect: false, explanation: '', score: 0, complete: false, isLoading: true, isSubmitting: false, errorMessage: '', wrongKey: '', showFeedback: false },
  onLoad(options) { const topic = TOPICS[options.topic]; if (topic) { this.setData({ topic, topicCode: options.topic }); this.startQuiz(); } else returnToChallengeTopics(); },
  startQuiz() {
    const { topic } = this.data; if (!topic) return;
    this.setData({ sessionId: '', currentIndex: 0, currentQuestion: null, nextQuestion: null, selectedOptionKey: '', answered: false, isCorrect: false, explanation: '', score: 0, complete: false, isLoading: true, isSubmitting: false, errorMessage: '', wrongKey: '', showFeedback: false });
    agentApi.createQuizSession({ topic: this.data.topicCode, difficulty: 1, targetQuestionCount: topic.count }).then((session) => this.setData({ sessionId: session.session_id, currentQuestion: session.question, complete: session.session_status === 'completed', isLoading: false, errorMessage: session.question ? '' : '题目正在准备中。' })).catch((error) => this.setData({ isLoading: false, errorMessage: error.message || '题目暂时不可用，请稍后再试。' }));
  },
  selectOption(event) { if (this.data.answered || this.data.isSubmitting) return; this.setData({ selectedOptionKey: event.currentTarget.dataset.optionKey, wrongKey: '', showFeedback: false }); },
  checkAnswer() {
    const { currentQuestion, selectedOptionKey, sessionId, answered, isSubmitting } = this.data; if (answered || isSubmitting) return;
    if (!selectedOptionKey || !currentQuestion) return wx.showToast({ title: '先选一个答案吧', icon: 'none' });
    this.setData({ isSubmitting: true, errorMessage: '' });
    agentApi.submitQuizAnswer({ sessionId, questionId: currentQuestion.id, answer: selectedOptionKey }).then((result) => {
      const isCorrect = Boolean(result.correct);
      if (isCorrect) {
        // 答对：解锁下一题，展示对勾与解析。
        this.setData({
          answered: true,
          isCorrect: true,
          showFeedback: true,
          wrongKey: '',
          explanation: result.explanation || '答得真好，继续加油！',
          score: result.score || 0,
          nextQuestion: result.next_question || null,
          complete: result.session_status === 'completed' && !result.next_question,
          isSubmitting: false
        });
      } else {
        // 答错：后端每题只收一次答案，不允许重答。直接标红错项、展示解析，并允许进入下一题。
        this.setData({
          answered: true,
          isCorrect: false,
          showFeedback: true,
          wrongKey: selectedOptionKey,
          explanation: result.explanation || '这题只能提交一次，看看解析，下一题加油。',
          nextQuestion: result.next_question || null,
          complete: result.session_status === 'completed' && !result.next_question,
          isSubmitting: false
        });
      }
    }).catch((error) => this.setData({ isSubmitting: false, errorMessage: error.message || '答案提交失败，请重试。' }));
  },
  nextQuestion() { if (!this.data.nextQuestion) return this.setData({ complete: true }); this.setData({ currentIndex: this.data.currentIndex + 1, currentQuestion: this.data.nextQuestion, nextQuestion: null, selectedOptionKey: '', answered: false, isCorrect: false, explanation: '', showFeedback: false, wrongKey: '', errorMessage: '' }); },
  retrySubmit() {
    const msg = this.data.errorMessage || '';
    // 后端判定本题已提交过（409 conflict）时，不再二次提交死循环，直接进入下一题/结果。
    if (msg.indexOf('已经提交') !== -1 || msg.indexOf('已提交') !== -1) {
      this.setData({
        errorMessage: '',
        answered: true,
        isCorrect: false,
        showFeedback: true,
        explanation: this.data.explanation || '这题已经提交过答案，我们继续下一题吧。'
      });
      return;
    }
    if (!this.data.isSubmitting) this.checkAnswer();
  },
  chooseAnotherTopic() { returnToChallengeTopics(); }
});
