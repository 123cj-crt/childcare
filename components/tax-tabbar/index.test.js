const assert = require('node:assert/strict');
const test = require('node:test');

let definition;
global.Component = (value) => { definition = value; };

let redirectUrl = '';
let navigateUrl = '';
global.wx = {
  redirectTo: ({ url }) => { redirectUrl = url; },
  navigateTo: ({ url }) => { navigateUrl = url; }
};

require('./index');

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
