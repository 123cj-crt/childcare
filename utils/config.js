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
const TAX_AGENT_CONFIG = {
  enableTaxAgent: true,
  agentUseMock: true,
  agentApiBaseUrl: '',
  agentTenantCode: 'childcare_miniprogram'
};

module.exports = {
  API_BASE_URL,
  CURRENT_ENV,
  ENVIRONMENTS,
  ...TAX_AGENT_CONFIG
};
