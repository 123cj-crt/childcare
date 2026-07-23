const agentApi = require('../../services/agent-api');

const QUIZ_TOPIC = 'tax';
const QUIZ_DIFFICULTY = 1;
const TARGET_QUESTION_COUNT = 3;

Page({
  data: {
    sessionId: '',
    targetQuestionCount: TARGET_QUESTION_COUNT,
    currentIndex: 0,
    currentQuestion: null,
    nextQuestion: null,
    selectedOptionKey: '',
    answered: false,
    isCorrect: false,
    explanation: '',
    score: 0,
    complete: false,
    noQuestions: false,
    isLoading: true,
    isSubmitting: false,
    errorMessage: ''
  },

  onLoad() {
    this.startNewQuiz();
  },

  startNewQuiz() {
    this.setData({
      sessionId: '',
      currentIndex: 0,
      currentQuestion: null,
      nextQuestion: null,
      selectedOptionKey: '',
      answered: false,
      isCorrect: false,
      explanation: '',
      score: 0,
      complete: false,
      noQuestions: false,
      isLoading: true,
      isSubmitting: false,
      errorMessage: ''
    });

    Promise.all([
      agentApi.getQuizQuestions({
        topic: QUIZ_TOPIC,
        difficulty: QUIZ_DIFFICULTY,
        limit: TARGET_QUESTION_COUNT
      }),
      agentApi.createQuizSession({
        topic: QUIZ_TOPIC,
        difficulty: QUIZ_DIFFICULTY,
        targetQuestionCount: TARGET_QUESTION_COUNT
      })
    ]).then(([previewQuestions, session]) => {
      const hasQuestions = previewQuestions.length > 0 && session.question;
      this.setData({
        sessionId: session.session_id,
        targetQuestionCount: Math.min(TARGET_QUESTION_COUNT, previewQuestions.length) || TARGET_QUESTION_COUNT,
        currentQuestion: session.question || null,
        score: session.score || 0,
        complete: hasQuestions && session.session_status === 'completed',
        noQuestions: !hasQuestions,
        isLoading: false
      });
    }).catch((error) => {
      console.warn('[财税学习] 闯关初始化失败', error);
      this.setData({
        isLoading: false,
        complete: false,
        noQuestions: false,
        errorMessage: error.message || '闯关题目暂时不可用'
      });
      wx.showToast({ title: '闯关题目暂时不可用', icon: 'none' });
    });
  },

  selectOption(event) {
    if (this.data.answered || this.data.isSubmitting) {
      return;
    }
    this.setData({ selectedOptionKey: event.currentTarget.dataset.optionKey });
  },

  checkAnswer() {
    const { currentQuestion, selectedOptionKey, sessionId } = this.data;
    if (!selectedOptionKey || !currentQuestion || !sessionId) {
      wx.showToast({ title: '先选一个答案吧', icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true, errorMessage: '' });
    agentApi.submitQuizAnswer({
      sessionId,
      questionId: currentQuestion.id,
      answer: selectedOptionKey
    }).then((result) => {
      this.setData({
        answered: true,
        isCorrect: Boolean(result.correct),
        explanation: result.explanation || '',
        score: result.score || 0,
        nextQuestion: result.next_question || null,
        complete: result.session_status === 'completed' && !result.next_question,
        isSubmitting: false
      });
    }).catch((error) => {
      console.warn('[财税学习] 提交答案失败', error);
      this.setData({
        isSubmitting: false,
        errorMessage: error.message || '答案提交失败，请重试。'
      });
    });
  },

  nextQuestion() {
    const { nextQuestion, currentIndex } = this.data;
    if (!nextQuestion) {
      this.setData({ complete: true });
      return;
    }

    this.setData({
      currentIndex: currentIndex + 1,
      currentQuestion: nextQuestion,
      nextQuestion: null,
      selectedOptionKey: '',
      answered: false,
      isCorrect: false,
      explanation: '',
      errorMessage: ''
    });
  },

  retrySubmit() {
    if (!this.data.isSubmitting) {
      this.checkAnswer();
    }
  },

  restartQuiz() {
    this.startNewQuiz();
  }
});
