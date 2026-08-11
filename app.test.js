const assert = require('node:assert/strict')
const { beforeEach, test } = require('node:test')

let appConfig
let storage

beforeEach(() => {
  storage = new Map([['openId', 'test-openid']])
  global.wx = {
    getStorageSync(key) {
      return storage.has(key) ? storage.get(key) : ''
    },
    setStorageSync(key, value) {
      storage.set(key, value)
    },
    removeStorageSync(key) {
      storage.delete(key)
    },
    cloud: {
      callFunction() {
        return Promise.resolve({ result: { code: 0, data: [] } })
      }
    }
  }
  global.App = config => {
    appConfig = config
  }

  const appPath = require.resolve('./app')
  delete require.cache[appPath]
  require('./app')
})

test('教师信息使用统一电话，音乐课使用指定老师', () => {
  assert.deepEqual(appConfig.getStandardTeacher('税收与公共服务', '王老师'), {
    name: '王老师',
    phone: '13660566366'
  })
  assert.deepEqual(appConfig.getStandardTeacher('听见旋律里的心情——音乐课', '王老师'), {
    name: '陈劲',
    phone: '13660566366'
  })
})

test('儿童云端列表使用 _id 作为本地 id 并更新当前用户缓存', async () => {
  wx.cloud.callFunction = () => Promise.resolve({
    result: {
      code: 0,
      data: [{ _id: 'cloud-child-1', name: '小朋友' }]
    }
  })

  const children = await appConfig.loadChildrenFromCloud.call(appConfig)

  assert.equal(children[0].id, 'cloud-child-1')
  assert.deepEqual(storage.get('myChildren_test-openid'), children)
})

test('云端暂时返回空列表时保留现有本地儿童', async () => {
  const localChildren = [{ id: 'local-child-1', name: '本地儿童' }]
  storage.set('myChildren_test-openid', localChildren)

  const children = await appConfig.loadChildrenFromCloud.call(appConfig)

  assert.deepEqual(children, localChildren)
})
