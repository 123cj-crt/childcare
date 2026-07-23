const {
  agentUseMock,
  agentApiBaseUrl,
  agentTenantCode
} = require('../utils/config');
const mockData = require('../mock/tax-agent/index');

function delay(value, duration = 450) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), duration);
  });
}

function normalizeResponse(response) {
  return response && response.data && response.data.data
    ? response.data.data
    : response.data;
}

function requestAgent(path, data) {
  if (!agentApiBaseUrl) {
    return Promise.reject(new Error('智能体服务地址尚未配置，请保持模拟模式或配置独立 FastAPI 地址。'));
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${agentApiBaseUrl}${path}`,
      method: 'POST',
      data: {
        ...data,
        tenantCode: agentTenantCode
      },
      header: {
        'content-type': 'application/json',
        'X-Agent-Tenant-Code': agentTenantCode
      },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(normalizeResponse(response));
          return;
        }
        reject(new Error(`智能体服务请求失败（${response.statusCode}）`));
      },
      fail(error) {
        reject(new Error(error.errMsg || '智能体服务暂时不可用'));
      }
    });
  });
}

function getAgentHome() {
  if (agentUseMock) {
    return delay({ recommendedQuestions: mockData.recommendedQuestions });
  }
  return requestAgent('/api/agent/home', {});
}

function sendChatMessage(message) {
  if (agentUseMock) {
    return delay({ answer: mockData.getMockReply(message) }, 650);
  }
  return requestAgent('/api/agent/chat', { message });
}

function getKnowledgeCards() {
  if (agentUseMock) {
    return delay(mockData.knowledgeCards);
  }
  return requestAgent('/api/agent/knowledge', {});
}

function getChallengeQuestions() {
  if (agentUseMock) {
    return delay(mockData.quizQuestions);
  }
  return requestAgent('/api/agent/challenge', {});
}

module.exports = {
  getAgentHome,
  sendChatMessage,
  getKnowledgeCards,
  getChallengeQuestions
};
