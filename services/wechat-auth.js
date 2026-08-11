const { request } = require('../utils/request');

const STORAGE_KEYS = {
  token: 'token',
  openId: 'openId',
  userInfo: 'userInfo',
  agentAccessToken: 'agentAccessToken',
  agentAccessTokenExpiresAt: 'agentAccessTokenExpiresAt',
  legacyAgentIdentity: 'taxAgentDevIdentity'
};

const DEFAULT_AGENT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;
const EXPIRY_SKEW_MS = 60 * 1000;

function createAuthError(message, details) {
  const error = new Error(message);
  error.type = 'authentication';
  error.details = details;
  return error;
}

function parseLoginPayload(loginData) {
  if (!loginData || loginData.code !== 200) {
    throw createAuthError(
      (loginData && loginData.msg) || '登录失败',
      loginData
    );
  }

  let payload = loginData.data;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      throw createAuthError('登录服务返回的数据格式不正确', loginData.data);
    }
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createAuthError('登录服务未返回有效身份', payload);
  }

  const openId = payload.openid || payload.openId || payload.open_id || '';
  const agentAccessToken = payload.agent_access_token || payload.agentAccessToken || '';
  const token = payload.token || agentAccessToken;
  const parsedExpiresIn = Number(
    payload.agent_expires_in || payload.agentExpiresIn || DEFAULT_AGENT_EXPIRES_IN_SECONDS
  );

  if (!openId || !agentAccessToken || !token) {
    throw createAuthError('登录服务未返回完整的智能体身份', payload);
  }

  return {
    openId,
    token,
    agentAccessToken,
    agentExpiresIn: Number.isFinite(parsedExpiresIn) && parsedExpiresIn > 0
      ? parsedExpiresIn
      : DEFAULT_AGENT_EXPIRES_IN_SECONDS
  };
}

function clearAgentRuntimeIdentity() {
  wx.removeStorageSync(STORAGE_KEYS.legacyAgentIdentity);
  if (typeof getApp === 'function') {
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.taxAgentChat = null;
    }
  }
}

function saveAuthentication(identity, profile = {}) {
  const previousOpenId = wx.getStorageSync(STORAGE_KEYS.openId);
  if (previousOpenId && previousOpenId !== identity.openId) {
    clearAgentRuntimeIdentity();
  }

  wx.setStorageSync(STORAGE_KEYS.token, identity.token);
  wx.setStorageSync(STORAGE_KEYS.openId, identity.openId);
  wx.setStorageSync(STORAGE_KEYS.agentAccessToken, identity.agentAccessToken);
  wx.setStorageSync(
    STORAGE_KEYS.agentAccessTokenExpiresAt,
    Date.now() + identity.agentExpiresIn * 1000
  );
  wx.removeStorageSync(STORAGE_KEYS.legacyAgentIdentity);

  const storedProfile = wx.getStorageSync(STORAGE_KEYS.userInfo) || {};
  const userInfo = {
    avatarUrl: profile.avatarUrl || storedProfile.avatarUrl || '',
    nickName: profile.nickName || storedProfile.nickName || ''
  };
  wx.setStorageSync(STORAGE_KEYS.userInfo, userInfo);
  return { ...identity, userInfo };
}

function getWechatCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(result) {
        if (!result || !result.code) {
          reject(createAuthError('微信登录未返回有效凭证', result));
          return;
        }
        resolve(result.code);
      },
      fail(error) {
        reject(createAuthError('微信登录失败，请重试', error));
      }
    });
  });
}

function loginWithWechat(profile = {}) {
  return getWechatCode()
    .then((code) => request({
      path: '/api/wechat/login',
      method: 'POST',
      data: {
        code,
        avatarUrl: profile.avatarUrl || '',
        nickName: profile.nickName || ''
      }
    }))
    .then((response) => saveAuthentication(parseLoginPayload(response.data), profile));
}

function getAgentAccessToken() {
  return wx.getStorageSync(STORAGE_KEYS.agentAccessToken) || '';
}

function ensureAgentAccessToken() {
  const loginToken = wx.getStorageSync(STORAGE_KEYS.token) || '';
  const openId = wx.getStorageSync(STORAGE_KEYS.openId) || '';
  if (!loginToken || !openId) {
    return Promise.reject(createAuthError('请先登录后再使用财税智能体'));
  }

  const token = getAgentAccessToken();
  const expiresAt = Number(wx.getStorageSync(STORAGE_KEYS.agentAccessTokenExpiresAt) || 0);
  if (token && expiresAt > Date.now() + EXPIRY_SKEW_MS) {
    return Promise.resolve(token);
  }
  return refreshAgentAccessToken();
}

function refreshAgentAccessToken() {
  const profile = wx.getStorageSync(STORAGE_KEYS.userInfo) || {};
  return loginWithWechat(profile).then((identity) => identity.agentAccessToken);
}

function clearAuthentication() {
  wx.removeStorageSync(STORAGE_KEYS.token);
  wx.removeStorageSync(STORAGE_KEYS.openId);
  wx.removeStorageSync(STORAGE_KEYS.userInfo);
  wx.removeStorageSync(STORAGE_KEYS.agentAccessToken);
  wx.removeStorageSync(STORAGE_KEYS.agentAccessTokenExpiresAt);
  clearAgentRuntimeIdentity();
}

function redirectToLoginAfterAuthenticationFailure() {
  clearAuthentication();
  wx.showToast({ title: '登录已失效，请重新登录', icon: 'none' });
  setTimeout(() => {
    wx.reLaunch({ url: '/pages/login/login' });
  }, 800);
}

module.exports = {
  STORAGE_KEYS,
  parseLoginPayload,
  saveAuthentication,
  loginWithWechat,
  getAgentAccessToken,
  ensureAgentAccessToken,
  refreshAgentAccessToken,
  clearAuthentication,
  clearAgentRuntimeIdentity,
  redirectToLoginAfterAuthenticationFailure
};
