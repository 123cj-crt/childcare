const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const agentApiPath = require.resolve('./agent-api');

let responses;
let requests;
let storage;
let agentApi;

beforeEach(() => {
  responses = [];
  requests = [];
  storage = new Map();
  global.wx = {
    request(options) {
      requests.push(options);
      options.success(responses.shift());
    },
    getStorageSync(key) {
      return storage.get(key);
    },
    setStorageSync(key, value) {
      storage.set(key, value);
    }
  };
  delete require.cache[agentApiPath];
  agentApi = require('./agent-api');
});

test('体验版初始化使用 development bootstrap 调试身份', async () => {
  responses.push(
    { statusCode: 200, data: { status: 'ok' } },
    {
      statusCode: 200,
      data: {
        tenant_code: 'childcare_miniprogram',
        user_id: 'development-user',
        child_profile_id: 'development-child'
      }
    }
  );

  const identity = await agentApi.initializeAgent();

  assert.equal(identity.user_id, 'development-user');
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url.endsWith('/health'), true);
  assert.equal(requests[1].url.endsWith('/api/v1/client/bootstrap'), true);
  assert.equal(requests[1].header.Authorization, undefined);
});

test('调试身份会保存在本地并复用于后续初始化', async () => {
  storage.set('taxAgentDevIdentity', {
    tenant_code: 'childcare_miniprogram',
    user_id: 'stored-user',
    child_profile_id: 'stored-child'
  });
  responses.push({ statusCode: 200, data: { status: 'ok' } });

  const identity = await agentApi.initializeAgent();

  assert.equal(identity.user_id, 'stored-user');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url.endsWith('/health'), true);
});

test('聊天请求不携带正式 Bearer Token', async () => {
  responses.push({
    statusCode: 200,
    data: { answer: '调试回答', session_id: 'session-1' }
  });

  await agentApi.sendChat({ message: '你好', sessionId: null });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].header.Authorization, undefined);
  assert.equal(requests[0].header['X-Agent-App'], 'childcare_miniprogram');
});
