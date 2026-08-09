const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

let definition;
global.Component = (value) => { definition = value; };

let redirectUrl = '';
let navigateUrl = '';
let navigateBackDelta = 0;
let pageStack = [];
global.wx = {
  redirectTo: ({ url }) => { redirectUrl = url; },
  navigateTo: ({ url }) => { navigateUrl = url; },
  navigateBack: ({ delta }) => { navigateBackDelta = delta; }
};
global.getCurrentPages = () => pageStack;

require('./index');

beforeEach(() => {
  redirectUrl = '';
  navigateUrl = '';
  navigateBackDelta = 0;
  pageStack = [];
});

test('财税导航包含四个固定入口', () => {
  assert.deepEqual(
    definition.data.items.map((item) => item.key),
    ['home', 'chat', 'knowledge', 'challenge']
  );
});

test('首页进入功能页时保留首页，功能页之间切换时替换当前页', () => {
  const homeContext = { properties: { current: 'home' } };
  definition.methods.switchPage.call(homeContext, {
    currentTarget: { dataset: { key: 'home', path: '/pages/tax-agent/index' } }
  });
  assert.equal(navigateUrl, '');

  definition.methods.switchPage.call(homeContext, {
    currentTarget: { dataset: { key: 'chat', path: '/pages/tax-agent/chat' } }
  });
  assert.equal(navigateUrl, '/pages/tax-agent/chat');

  const featureContext = { properties: { current: 'chat' } };
  definition.methods.switchPage.call(featureContext, {
    currentTarget: { dataset: { key: 'knowledge', path: '/pages/tax-agent/knowledge' } }
  });
  assert.equal(redirectUrl, '/pages/tax-agent/knowledge');
});

test('功能页点击首页时返回页面栈中已有的财税首页', () => {
  pageStack = [
    { route: 'pages/index/index' },
    { route: 'pages/tax-agent/index' },
    { route: 'pages/tax-agent/chat' }
  ];

  definition.methods.switchPage.call(
    { properties: { current: 'chat' } },
    { currentTarget: { dataset: { key: 'home', path: '/pages/tax-agent/index' } } }
  );

  assert.equal(navigateBackDelta, 1);
  assert.equal(redirectUrl, '');
});

test('返回首页时一次清理历史遗留的重复财税首页', () => {
  pageStack = [
    { route: 'pages/index/index' },
    { route: 'pages/tax-agent/index' },
    { route: 'pages/tax-agent/index' },
    { route: 'pages/tax-agent/knowledge' }
  ];

  definition.methods.switchPage.call(
    { properties: { current: 'knowledge' } },
    { currentTarget: { dataset: { key: 'home', path: '/pages/tax-agent/index' } } }
  );

  assert.equal(navigateBackDelta, 2);
  assert.equal(redirectUrl, '');
});

test('直接打开功能页且栈中没有财税首页时使用替换跳转兜底', () => {
  pageStack = [{ route: 'pages/tax-agent/challenge' }];

  definition.methods.switchPage.call(
    { properties: { current: 'challenge' } },
    { currentTarget: { dataset: { key: 'home', path: '/pages/tax-agent/index' } } }
  );

  assert.equal(navigateBackDelta, 0);
  assert.equal(redirectUrl, '/pages/tax-agent/index');
});
