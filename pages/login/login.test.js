const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const loginPagePath = require.resolve('./login');
const wechatAuthPath = require.resolve('../../services/wechat-auth');

let page;
let loginProfiles;
let switchedTabs;

beforeEach(() => {
  loginProfiles = [];
  switchedTabs = [];

  global.getApp = () => ({ recordActivityLog() {} });
  global.Page = (definition) => {
    page = {
      ...definition,
      data: { ...definition.data, agreeChecked: true },
      setData(update) {
        Object.assign(this.data, update);
      }
    };
  };
  global.setTimeout = (callback) => {
    callback();
    return 1;
  };
  global.wx = {
    getUserProfile(options) {
      options.fail({ errMsg: 'getUserProfile:fail auth deny' });
    },
    showToast() {},
    switchTab(options) {
      switchedTabs.push(options.url);
    }
  };

  delete require.cache[loginPagePath];
  require.cache[wechatAuthPath] = {
    exports: {
      loginWithWechat(profile) {
        loginProfiles.push(profile);
        return Promise.resolve({ userInfo: {} });
      }
    }
  };
  require('./login');
});

test('拒绝头像昵称授权时仍继续执行微信身份登录', async () => {
  page.quickLogin();
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(loginProfiles, [{}]);
  assert.deepEqual(switchedTabs, ['/pages/index/index']);
  assert.equal(page.data.loggingIn, false);
});
