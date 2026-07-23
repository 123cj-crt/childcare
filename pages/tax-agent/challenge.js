const agentApi = require('../../services/agent-api');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    selectedOptionIndex: null,
    answered: false,
    isCorrect: false,
    score: 0,
    complete: false,
    isLoading: true
  },

  onLoad() {
    agentApi.getChallengeQuestions()
      .then((questions) => this.startQuiz(questions || []))
      .catch((error) => {
        console.warn('[财税学习] 闯关题目加载失败', error);
        this.setData({ isLoading: false });
        wx.showToast({ title: '闯关题目暂时不可用', icon: 'none' });
      });
  },

  startQuiz(questions) {
    this.setData({
      questions,
      currentIndex: 0,
      currentQuestion: questions[0] || null,
      selectedOptionIndex: null,
      answered: false,
      isCorrect: false,
      score: 0,
      complete: questions.length === 0,
      isLoading: false
    });
  },

  selectOption(event) {
    if (this.data.answered) {
      return;
    }
    this.setData({ selectedOptionIndex: Number(event.currentTarget.dataset.index) });
  },

  checkAnswer() {
    const { currentQuestion, selectedOptionIndex } = this.data;
    if (selectedOptionIndex === null || !currentQuestion) {
      wx.showToast({ title: '先选一个答案吧', icon: 'none' });
      return;
    }

    const isCorrect = selectedOptionIndex === currentQuestion.correctOption;
    this.setData({
      answered: true,
      isCorrect,
      score: this.data.score + (isCorrect ? 1 : 0)
    });
  },

  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      this.setData({ complete: true });
      return;
    }

    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      selectedOptionIndex: null,
      answered: false,
      isCorrect: false
    });
  },

  restartQuiz() {
    this.startQuiz(this.data.questions);
  }
});
