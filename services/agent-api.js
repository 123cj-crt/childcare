const {
  agentUseMock,
  agentApiBaseUrl,
  agentTenantCode
} = require('../utils/config');
const {
  STORAGE_KEYS,
  ensureAgentAccessToken,
  refreshAgentAccessToken,
  redirectToLoginAfterAuthenticationFailure
} = require('./wechat-auth');
const mockData = require('../mock/tax-agent/index');

const IDENTITY_STORAGE_KEY = STORAGE_KEYS.agentIdentity;
const REQUEST_TIMEOUT = 15000;
let mockQuizSession = null;

function delay(value, duration = 450) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), duration);
  });
}

function createAgentError({ type, message, path, statusCode, data, errMsg }) {
  const error = new Error(message);
  error.type = type;
  error.path = path;
  error.statusCode = statusCode;
  error.data = data;
  error.errMsg = errMsg;
  return error;
}

function friendlyRequestMessage(statusCode, detail) {
  if (statusCode === 400 || statusCode === 422) return '这次的小请求不完整，请再试一次。';
  if (statusCode === 404) return '暂时没有找到需要的内容。';
  if (statusCode >= 500) return '小税正在休息一下，请稍后再试。';
  return detail && typeof detail === 'string' && detail.length <= 30
    ? detail
    : '小税暂时没有收到消息，请稍后再试。';
}

function ensureConfigured() {
  if (!agentApiBaseUrl) {
    throw createAgentError({
      type: 'configuration',
      message: '智能体服务地址尚未配置，请保持模拟模式或填写 FastAPI 地址。'
    });
  }
}

function buildUrl(path, query) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = agentApiBaseUrl.replace(/\/$/, '');
  const queryItems = Object.keys(query || {})
    .filter((key) => query[key] !== undefined && query[key] !== null && query[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`);
  return `${baseUrl}${normalizedPath}${queryItems.length ? `?${queryItems.join('&')}` : ''}`;
}

function performAgentRequest({ path, method = 'GET', data, query, token }) {
  ensureConfigured();
  const url = buildUrl(path, query);

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      timeout: REQUEST_TIMEOUT,
      header: {
        'content-type': 'application/json',
        'X-Agent-App': agentTenantCode,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }

        reject(createAgentError({
          type: 'http',
          message: friendlyRequestMessage(
            response.statusCode,
            response.data && response.data.detail
          ),
          path,
          statusCode: response.statusCode,
          data: response.data
        }));
      },
      fail(error) {
        reject(createAgentError({
          type: error.errMsg && error.errMsg.indexOf('timeout') !== -1 ? 'timeout' : 'network',
          message: error.errMsg && error.errMsg.indexOf('timeout') !== -1
            ? '小税想得有点久，请稍后再试。'
            : '小税暂时连不上，请检查网络后再试。',
          path,
          errMsg: error.errMsg
        }));
      }
    });
  });
}

function requestAgent(options) {
  if (!options.requiresAuth) {
    return performAgentRequest(options);
  }

  return ensureAgentAccessToken()
    .then((token) => performAgentRequest({ ...options, token }))
    .catch((error) => {
      if (!error || error.statusCode !== 401) {
        throw error;
      }

      return refreshAgentAccessToken()
        .then((token) => performAgentRequest({ ...options, token }))
        .catch((retryError) => {
          if (retryError && (
            retryError.statusCode === 401 || retryError.type === 'authentication'
          )) {
            redirectToLoginAfterAuthenticationFailure();
          }
          throw retryError;
        });
    });
}

function requireObject(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createAgentError({
      type: 'format',
      message: '智能体服务返回的数据格式不正确。',
      path,
      data: value
    });
  }
  return value;
}

function saveIdentity(identity) {
  wx.setStorageSync(IDENTITY_STORAGE_KEY, identity);
  return identity;
}

function getMockIdentity() {
  return {
    tenant_code: agentTenantCode,
    user_id: 'mock-user',
    child_profile_id: 'mock-child',
    mode: 'mock'
  };
}

function healthCheck() {
  if (agentUseMock) {
    return delay({ status: 'ok', mode: 'mock' }, 80);
  }

  return requestAgent({ path: '/health' }).then((response) => {
    const data = requireObject(response, '/health');
    if (data.status !== 'ok') {
      throw createAgentError({
        type: 'format',
        message: '智能体服务健康检查未返回可用状态。',
        path: '/health',
        data
      });
    }
    return data;
  });
}

function getCurrentIdentity() {
  if (agentUseMock) {
    return delay(getMockIdentity(), 80);
  }

  return requestAgent({
    path: '/api/v1/client/me',
    requiresAuth: true
  }).then((response) => {
    const identity = requireObject(response, '/api/v1/client/me');
    if (identity.tenant_code !== agentTenantCode || !identity.user_id || !identity.child_profile_id) {
      throw createAgentError({
        type: 'format',
        message: '智能体服务未返回有效的学习身份。',
        path: '/api/v1/client/me',
        data: identity
      });
    }
    return saveIdentity(identity);
  });
}

function initializeAgent() {
  if (agentUseMock) {
    return Promise.resolve(getMockIdentity());
  }
  return healthCheck().then(() => getCurrentIdentity());
}

function getAgentHome() {
  return delay({ recommendedQuestions: mockData.recommendedQuestions }, agentUseMock ? 160 : 0);
}

function sendChat({ message, sessionId }) {
  if (agentUseMock) {
    return delay({
      answer: mockData.getMockReply(message),
      session_id: sessionId || 'mock-chat-session',
      sources: [],
      usage: null
    }, 650);
  }

  return requestAgent({
    path: '/api/v1/client/chat',
    method: 'POST',
    requiresAuth: true,
    data: {
      message,
      session_id: sessionId || null
    }
  }).then((response) => {
    const chat = requireObject(response, '/api/v1/client/chat');
    if (typeof chat.answer !== 'string' || !chat.answer.trim() || !chat.session_id) {
      throw createAgentError({
        type: 'format',
        message: '智能体服务未返回完整的对话结果。',
        path: '/api/v1/client/chat',
        data: chat
      });
    }
    return chat;
  });
}

function getKnowledgeCards() {
  if (agentUseMock) {
    return delay(mockData.knowledgeCards);
  }

  return requestAgent({ path: '/api/v1/client/knowledge/cards' }).then((response) => {
    if (!Array.isArray(response)) {
      throw createAgentError({
        type: 'format',
        message: '智能体服务未返回知识卡片列表。',
        path: '/api/v1/client/knowledge/cards',
        data: response
      });
    }
    return response;
  });
}

function toMockPublicQuestion(question) {
  return {
    id: String(question.id),
    question_type: 'single_choice',
    topic: 'tax',
    difficulty: 1,
    prompt: question.question,
    options: question.options.map((content, index) => ({
      option_key: String.fromCharCode(65 + index),
      content
    }))
  };
}

function getQuizQuestions({ topic = 'tax', difficulty = 1, limit = 20 } = {}) {
  if (agentUseMock) {
    return delay(mockData.quizQuestions.slice(0, limit).map(toMockPublicQuestion));
  }

  return requestAgent({
    path: '/api/v1/client/quiz/questions',
    query: { topic, difficulty, limit }
  }).then((response) => {
    if (!Array.isArray(response)) {
      throw createAgentError({
        type: 'format',
        message: '智能体服务未返回闯关题目列表。',
        path: '/api/v1/client/quiz/questions',
        data: response
      });
    }
    return response;
  });
}

function createQuizSession({ topic = 'tax', difficulty = 1, targetQuestionCount = 3 } = {}) {
  if (agentUseMock) {
    const questions = mockData.quizQuestions.slice(0, targetQuestionCount);
    mockQuizSession = {
      id: `mock-quiz-${Date.now()}`,
      questions,
      currentIndex: 0,
      score: 0
    };
    return delay({
      session_id: mockQuizSession.id,
      question: questions[0] ? toMockPublicQuestion(questions[0]) : null,
      score: 0,
      session_status: questions.length ? 'in_progress' : 'completed'
    });
  }

  return requestAgent({
    path: '/api/v1/client/quiz/sessions',
    method: 'POST',
    requiresAuth: true,
    data: {
      topic,
      difficulty,
      target_question_count: targetQuestionCount
    }
  }).then((response) => requireObject(response, '/api/v1/client/quiz/sessions'));
}

function submitQuizAnswer({ sessionId, questionId, answer }) {
  if (agentUseMock) {
    if (!mockQuizSession || mockQuizSession.id !== sessionId) {
      return Promise.reject(createAgentError({
        type: 'mock',
        message: '本轮模拟闯关已失效，请重新开始。'
      }));
    }
    const question = mockQuizSession.questions[mockQuizSession.currentIndex];
    const correct = String.fromCharCode(65 + question.correctOption) === answer;
    mockQuizSession.score += correct ? 1 : 0;
    mockQuizSession.currentIndex += 1;
    const next = mockQuizSession.questions[mockQuizSession.currentIndex];
    return delay({
      correct,
      explanation: question.explanation,
      score: mockQuizSession.score,
      next_question: next ? toMockPublicQuestion(next) : null,
      session_status: next ? 'in_progress' : 'completed'
    }, 350);
  }

  return requestAgent({
    path: '/api/v1/client/quiz/submit',
    method: 'POST',
    requiresAuth: true,
    data: {
      session_id: sessionId,
      question_id: questionId,
      answer
    }
  }).then((response) => requireObject(response, '/api/v1/client/quiz/submit'));
}

module.exports = {
  IDENTITY_STORAGE_KEY,
  healthCheck,
  getCurrentIdentity,
  initializeAgent,
  getAgentHome,
  sendChat,
  getKnowledgeCards,
  createQuizSession,
  getQuizQuestions,
  submitQuizAnswer
};
