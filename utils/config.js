// 小程序接口环境配置。
// 开发者工具与本机后端同机运行时使用 127.0.0.1；真机调试请改为后端电脑当前的局域网 IPv4。
const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'https://gdufe-childcare.cn'
  },
  production: {
    API_BASE_URL: 'https://gdufe-childcare.cn'
  }
};

const CURRENT_ENV = 'production';
const API_BASE_URL = ENVIRONMENTS[CURRENT_ENV].API_BASE_URL;

// 财税学习智能体与原有 Spring Boot 接口完全独立。
// 财税智能体统一使用已登记的正式 HTTPS 服务地址。
const TAX_AGENT_ENVIRONMENTS = {
  development: {
    // 仅适用于微信开发者工具与 FastAPI 在同一台电脑的本地联调。
    baseUrl: 'https://api.zhishuitu.cn'
  },
  production: {
    // 备案和上线后填写已配置微信 request 合法域名的 HTTPS 地址。
    baseUrl: 'https://api.zhishuitu.cn'
  }
};

const AGENT_CURRENT_ENV = CURRENT_ENV;
const WECHAT_LOGIN_MODES = {
  development: 'mock',
  // [临时体验版 2026-08-12] 后端 /api/wechat/login 尚未稳定，先走本地身份登录，不依赖 Spring Boot。
  // 8/15 前后端联调、后端登录接口稳定后，请改回 'wechat'。
  production: 'mock'
};
const wechatLoginMode = WECHAT_LOGIN_MODES[CURRENT_ENV];
const TAX_AGENT_CONFIG = {
  enableTaxAgent: true,
  // [临时体验版 2026-08-12] 后端 / 智能体鉴权尚未就绪，先用内置演示数据，保证智能体页面不崩、不踢人。
  // 8/15 前后端联调、真实登录与智能体服务可用后，请改回 false。
  agentUseMock: true,
  agentApiBaseUrl: TAX_AGENT_ENVIRONMENTS[AGENT_CURRENT_ENV].baseUrl,
  agentTenantCode: 'childcare_miniprogram'
};

module.exports = {
  API_BASE_URL,
  CURRENT_ENV,
  ENVIRONMENTS,
  AGENT_CURRENT_ENV,
  TAX_AGENT_ENVIRONMENTS,
  WECHAT_LOGIN_MODES,
  wechatLoginMode,
  ...TAX_AGENT_CONFIG
};
