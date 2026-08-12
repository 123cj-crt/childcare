const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

let definition;
let pageStack = [];
let navigateBackCount = 0;
let redirectUrl = '';
let createSessionCalls = [];
let createSessionError = null;
let submitAnswerResult = null;

const agentApiPath = require.resolve('../../services/agent-api');
require.cache[agentApiPath] = {
  exports: {
    createQuizSession(payload) {
      createSessionCalls.push(payload);
      if (createSessionError) return Promise.reject(createSessionError);
      return Promise.resolve({
        session_id: 'quiz-session',
        question: {
          id: 'question-1',
          prompt: '测试题目',
          options: [{ option_key: 'A', content: '选项 A' }]
        },
        score: 0,
        session_status: 'started'
      });
    },
    submitQuizAnswer() {
      return Promise.resolve(submitAnswerResult);
    }
  }
};

global.Page = (value) => { definition = value; };
global.getCurrentPages = () => pageStack;
global.wx = {
  navigateBack: () => { navigateBackCount += 1; },
  redirectTo: ({ url }) => { redirectUrl = url; }
};

require('./challenge-quiz');

beforeEach(() => {
  pageStack = [];
  navigateBackCount = 0;
  redirectUrl = '';
  createSessionCalls = [];
  createSessionError = null;
  submitAnswerResult = null;
});

function createPage(data = {}) {
  return {
    ...definition,
    data: { ...definition.data, ...data },
    setData(update) {
      Object.assign(this.data, update);
    }
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

test('无效题目页有上一页时正常返回', () => {
  pageStack = [
    { route: 'pages/tax-agent/challenge' },
    { route: 'pages/tax-agent/challenge-quiz' }
  ];

  definition.onLoad.call({}, {});

  assert.equal(navigateBackCount, 1);
  assert.equal(redirectUrl, '');
});

test('直接打开无效题目页时回到闯关主题页', () => {
  pageStack = [{ route: 'pages/tax-agent/challenge-quiz' }];

  definition.onLoad.call({}, {});

  assert.equal(navigateBackCount, 0);
  assert.equal(redirectUrl, '/pages/tax-agent/challenge');
});

test('直接打开题目页后选择其他主题时回到闯关主题页', () => {
  pageStack = [{ route: 'pages/tax-agent/challenge-quiz' }];

  definition.chooseAnotherTopic.call({});

  assert.equal(navigateBackCount, 0);
  assert.equal(redirectUrl, '/pages/tax-agent/challenge');
});

test('五个主题创建会话时都明确请求 10 题', async () => {
  const topics = [
    'personal-income-tax',
    'resource-tax',
    'life-tax-fees',
    'public-service',
    'invoice'
  ];

  for (const topic of topics) {
    const page = createPage();
    definition.onLoad.call(page, { topic });
    await flushPromises();
  }

  assert.equal(createSessionCalls.length, topics.length);
  assert.deepEqual(
    createSessionCalls.map((payload) => payload.targetQuestionCount),
    [10, 10, 10, 10, 10]
  );
});

test('答完第 3 题后后端仍返回下一题时继续闯关', async () => {
  submitAnswerResult = {
    correct: true,
    explanation: '答对啦',
    score: 3,
    next_question: {
      id: 'question-4',
      prompt: '第 4 题',
      options: [{ option_key: 'A', content: '选项 A' }]
    },
    session_status: 'started'
  };
  const page = createPage({
    topic: { title: '个人所得税', count: 10 },
    topicCode: 'personal-income-tax',
    sessionId: 'quiz-session',
    currentIndex: 2,
    currentQuestion: { id: 'question-3' },
    selectedOptionKey: 'A'
  });

  definition.checkAnswer.call(page);
  await flushPromises();

  assert.equal(page.data.complete, false);
  assert.equal(page.data.nextQuestion.id, 'question-4');
  definition.nextQuestion.call(page);
  assert.equal(page.data.currentIndex, 3);
  assert.equal(page.data.currentQuestion.id, 'question-4');
  assert.equal(page.data.complete, false);
});

test('题库不足时显示提示且不进入完成页', async () => {
  createSessionError = new Error(
    '当前主题题目正在补充中，暂时无法开始 10 题闯关，请稍后再试。'
  );
  const page = createPage();

  definition.onLoad.call(page, { topic: 'invoice' });
  await flushPromises();

  assert.equal(page.data.complete, false);
  assert.equal(page.data.currentQuestion, null);
  assert.equal(
    page.data.errorMessage,
    '当前主题题目正在补充中，暂时无法开始 10 题闯关，请稍后再试。'
  );
});

test('答题后使用正确和错误状态，不把错误选项显示为绿色勾', () => {
  const wxml = fs.readFileSync(
    path.join(__dirname, 'challenge-quiz.wxml'),
    'utf8'
  );

  assert.match(wxml, /answered && isCorrect \? 'answer-correct' : ''/);
  assert.match(wxml, /answered && !isCorrect \? 'answer-wrong' : ''/);
  assert.match(wxml, /answered \? \(isCorrect \? '✓' : '✕'\) : '✓'/);
});
