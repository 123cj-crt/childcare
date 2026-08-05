const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

let definition;
let pageStack = [];
let navigateBackCount = 0;
let redirectUrl = '';

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
});

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
