// 小程序接口环境配置。
// 开发者工具与本机后端同机运行时使用 127.0.0.1；真机调试请改为后端电脑当前的局域网 IPv4。
const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'http://127.0.0.1:8080'
  },
  production: {
    // 上线前由部署方填写已在微信公众平台登记的 HTTPS 合法域名。
    API_BASE_URL: ''
  }
};

const CURRENT_ENV = 'development';
const API_BASE_URL = ENVIRONMENTS[CURRENT_ENV].API_BASE_URL;

// 财税学习智能体与原有 Spring Boot 接口完全独立。
// 本阶段默认使用本地模拟数据；接入 FastAPI 时仅填写 agentApiBaseUrl 并关闭 agentUseMock。
const TAX_AGENT_ENVIRONMENTS = {
  development: {
    // 仅适用于微信开发者工具与 FastAPI 在同一台电脑的本地联调。
    baseUrl: 'http://127.0.0.1:8000'
  },
  production: {
    // 备案和上线后填写已配置微信 request 合法域名的 HTTPS 地址。
    baseUrl: ''
  }
};

const AGENT_CURRENT_ENV = CURRENT_ENV;
const TAX_AGENT_CONFIG = {
  enableTaxAgent: true,
  // 本地 FastAPI 联调：仅适用于微信开发者工具与后端在同一台电脑时。
  // 真机调试和正式发布必须替换为可访问、已配置的 HTTPS 地址。
  agentUseMock: false,
  agentApiBaseUrl: TAX_AGENT_ENVIRONMENTS[AGENT_CURRENT_ENV].baseUrl,
  agentTenantCode: 'childcare_miniprogram'
};

module.exports = {
  API_BASE_URL,
  CURRENT_ENV,
  ENVIRONMENTS,
  AGENT_CURRENT_ENV,
  TAX_AGENT_ENVIRONMENTS,
  ...TAX_AGENT_CONFIG
};
