const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const storage = new Map();
let appState;

global.getApp = () => appState;
global.wx = {
  getStorageSync(key) {
    return storage.get(key);
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
  removeStorageSync(key) {
    storage.delete(key);
  }
};

const {
  STORAGE_KEYS,
  parseLoginPayload,
  saveAuthentication,
  ensureAgentAccessToken,
  clearAuthentication
} = require('./wechat-auth');

beforeEach(() => {
  storage.clear();
  appState = { globalData: { taxAgentChat: { sessionId: 'old-session' } } };
});

test('兼容解析 Spring 登录的 JSON 字符串和对象 data', () => {
  const payload = {
    token: 'spring-jwt',
    openid: 'openid-a',
    agent_access_token: 'spring-jwt',
    agent_expires_in: 604800
  };

  const fromString = parseLoginPayload({ code: 200, data: JSON.stringify(payload) });
  const fromObject = parseLoginPayload({ code: 200, data: payload });

  assert.deepEqual(fromString, fromObject);
  assert.equal(fromString.agentAccessToken, 'spring-jwt');
  assert.equal(fromString.agentExpiresIn, 604800);
});

test('保存微信身份并在账号变化时清除旧智能体会话', () => {
  storage.set(STORAGE_KEYS.openId, 'openid-old');
  storage.set(STORAGE_KEYS.legacyAgentIdentity, { user_id: 'legacy' });

  saveAuthentication({
    openId: 'openid-new',
    token: 'token-new',
    agentAccessToken: 'agent-token-new',
    agentExpiresIn: 604800
  }, { nickName: '体验用户' });

  assert.equal(storage.get(STORAGE_KEYS.openId), 'openid-new');
  assert.equal(storage.get(STORAGE_KEYS.agentAccessToken), 'agent-token-new');
  assert.equal(storage.has(STORAGE_KEYS.legacyAgentIdentity), false);
  assert.equal(appState.globalData.taxAgentChat, null);
});

test('退出登录会同时清除微信身份、智能体 Token 和运行期会话', () => {
  Object.values(STORAGE_KEYS).forEach((key) => storage.set(key, 'value'));

  clearAuthentication();

  Object.values(STORAGE_KEYS).forEach((key) => assert.equal(storage.has(key), false));
  assert.equal(appState.globalData.taxAgentChat, null);
});

test('未完成小程序登录时不静默创建智能体身份', async () => {
  await assert.rejects(
    ensureAgentAccessToken(),
    (error) => error.type === 'authentication'
  );
});
