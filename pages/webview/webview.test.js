const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

let definition;
let pageStack = [];
let navigateBackCount = 0;
let switchTabUrl = '';

global.Page = (value) => { definition = value; };
global.getCurrentPages = () => pageStack;
global.wx = {
  navigateBack: () => { navigateBackCount += 1; },
  switchTab: ({ url }) => { switchTabUrl = url; }
};

require('./webview');

beforeEach(() => {
  pageStack = [];
  navigateBackCount = 0;
  switchTabUrl = '';
});

test('从首页进入网页时返回上一页', () => {
  pageStack = [
    { route: 'pages/index/index' },
    { route: 'pages/webview/webview' }
  ];

  definition.goBack.call({});

  assert.equal(navigateBackCount, 1);
  assert.equal(switchTabUrl, '');
});

test('直接打开网页时返回智慧托育首页', () => {
  pageStack = [{ route: 'pages/webview/webview' }];

  definition.goBack.call({});

  assert.equal(navigateBackCount, 0);
  assert.equal(switchTabUrl, '/pages/index/index');
});
