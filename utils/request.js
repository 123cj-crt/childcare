const { API_BASE_URL } = require('./config');

function getApiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL 未配置：生产环境必须配置 HTTPS 合法域名。');
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function request({ path, method = 'GET', data, header = {} }) {
  const url = getApiUrl(path);

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response);
          return;
        }

        const error = {
          type: 'http',
          path,
          url,
          statusCode: response.statusCode,
          data: response.data
        };
        console.error('[API] 请求返回非成功状态', error);
        reject(error);
      },
      fail(error) {
        const normalizedError = {
          type: 'network',
          path,
          url,
          errMsg: error.errMsg
        };
        console.error('[API] 请求失败', normalizedError);
        reject(normalizedError);
      }
    });
  });
}

module.exports = {
  API_BASE_URL,
  getApiUrl,
  request
};
