const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const agentApiPath = require.resolve('./agent-api');
const wechatAuthPath = require.resolve('./wechat-auth');

let responses;
let requests;
let storage;
let loginCalls;
let relaunches;
let agentApi;

function successfulLoginResponse(token = 'refreshed-agent-token') {
  return {
    statusCode: 200,
    data: {
      code: 200,
      data: JSON.stringify({
        token,
        openid: 'openid-a',
        agent_access_token: token,
        agent_expires_in: 604800
      })
    }
  };
}

beforeEach(() => {
  responses = [];
  requests = [];
  storage = new Map([
    ['token', 'spring-agent-token'],
    ['openId', 'openid-a'],
    ['agentAccessToken', 'spring-agent-token'],
    ['agentAccessTokenExpiresAt', Date.now() + 3600000]
  ]);
  loginCalls = 0;
  relaunches = [];

  global.getApp = () => ({
    globalData: { taxAgentChat: { sessionId: 'session-old' } }
  });
  global.setTimeout = (callback) => {
    callback();
    return 1;
  };
  global.wx = {
    request(options) {
      requests.push(options);
      const response = responses.shift();
      if (!response) throw new Error(`没有为 ${options.url} 准备响应`);
      options.success(response);
    },
    login(options) {
      loginCalls += 1;
      options.success({ code: `wechat-code-${loginCalls}` });
    },
    getStorageSync(key) {
      return storage.get(key);
    },
    setStorageSync(key, value) {
      storage.set(key, value);
    },
    removeStorageSync(key) {
      storage.delete(key);
    },
    showToast() {},
    reLaunch(options) {
      relaunches.push(options.url);
    }
  };

  delete require.cache[agentApiPath];
  delete require.cache[wechatAuthPath];
  agentApi = require('./agent-api');
});

test('体验版初始化先检查健康状态再携带 Bearer 获取当前身份', async () => {
  responses.push(
    { statusCode: 200, data: { status: 'ok' } },
    {
      statusCode: 200,
      data: {
        tenant_code: 'childcare_miniprogram',
        external_child_id: 'wechat-account:anonymous',
        user_id: 'mapped-user',
        child_profile_id: 'mapped-child'
      }
    }
  );

  const identity = await agentApi.initializeAgent();

  assert.equal(identity.user_id, 'mapped-user');
  assert.equal(requests[0].url.endsWith('/health'), true);
  assert.equal(requests[0].header.Authorization, undefined);
  assert.equal(requests[1].url.endsWith('/api/v1/client/me'), true);
  assert.equal(requests[1].header.Authorization, 'Bearer spring-agent-token');
});

test('聊天请求携带 Bearer 且不发送内部用户 UUID', async () => {
  responses.push({
    statusCode: 200,
    data: { answer: '测试回答', session_id: 'session-1' }
  });

  await agentApi.sendChat({ message: '你好', sessionId: null });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].header.Authorization, 'Bearer spring-agent-token');
  assert.equal(requests[0].header['X-Agent-App'], 'childcare_miniprogram');
  assert.equal(requests[0].data.user_id, undefined);
  assert.equal(requests[0].data.child_profile_id, undefined);
});

test('知识卡片公开请求不携带 Bearer', async () => {
  responses.push({ statusCode: 200, data: [] });

  await agentApi.getKnowledgeCards();

  assert.equal(requests[0].header.Authorization, undefined);
});

test('首次 401 只刷新一次 Token 并重试原请求一次', async () => {
  responses.push(
    { statusCode: 401, data: { detail: 'expired' } },
    successfulLoginResponse(),
    { statusCode: 200, data: { answer: '刷新后回答', session_id: 'session-2' } }
  );

  const response = await agentApi.sendChat({ message: '你好', sessionId: null });

  assert.equal(response.answer, '刷新后回答');
  assert.equal(loginCalls, 1);
  assert.equal(requests.length, 3);
  assert.equal(requests[2].header.Authorization, 'Bearer refreshed-agent-token');
  assert.equal(relaunches.length, 0);
});

test('刷新后再次 401 会清除身份并返回登录页', async () => {
  responses.push(
    { statusCode: 401, data: { detail: 'expired' } },
    successfulLoginResponse(),
    { statusCode: 401, data: { detail: 'still invalid' } }
  );

  await assert.rejects(
    agentApi.sendChat({ message: '你好', sessionId: null }),
    (error) => error.statusCode === 401
  );

  assert.equal(loginCalls, 1);
  assert.equal(storage.has('agentAccessToken'), false);
  assert.deepEqual(relaunches, ['/pages/login/login']);
});

test('403 不刷新 Token 也不循环重试', async () => {
  responses.push({ statusCode: 403, data: { detail: 'tenant mismatch' } });

  await assert.rejects(
    agentApi.sendChat({ message: '你好', sessionId: null }),
    (error) => error.statusCode === 403
  );

  assert.equal(loginCalls, 0);
  assert.equal(requests.length, 1);
});
