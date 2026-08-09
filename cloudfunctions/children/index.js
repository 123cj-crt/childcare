// 云函数：children
// 处理儿童信息的云端同步（跨设备、跨微信账号隔离）
// 部署后在客户端通过 wx.cloud.callFunction({ name: 'children' }) 调用
// 注意：需在云开发控制台创建 children 集合，权限设为"所有用户可读，仅创建者可写"

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  console.log('[children] action=%s, openid=%s', action, openid)

  try {
    switch (action) {

      // ===== 查询当前用户的所有儿童（按创建时间倒序） =====
      case 'list': {
        const res = await db.collection('children')
          .where({ _openid: openid })
          .orderBy('createTime', 'desc')
          .get()
        return { code: 0, data: res.data }
      }

      // ===== 新增儿童 =====
      case 'add': {
        const child = event.child || {}
        const addRes = await db.collection('children').add({
          data: {
            name: child.name || '',
            age: child.age || '',
            gender: child.gender || '男',
            relation: child.relation || '',
            parentName: child.parentName || '',
            phoneNumber: child.phoneNumber || '',
            address: child.address || '',
            grade: child.grade || '',
            avatar: child.avatar || '/images/default-avatar.png',
            createTime: db.serverDate()
          }
        })
        return { code: 0, _id: addRes._id }
      }

      // ===== 修改儿童 =====
      case 'update': {
        const { id, child } = event
        const exist = await db.collection('children').doc(id).get()
        if (!exist.data || exist.data._openid !== openid) {
          return { code: -1, msg: '无权修改该儿童信息' }
        }
        await db.collection('children').doc(id).update({
          data: {
            name: child.name,
            age: child.age,
            gender: child.gender,
            relation: child.relation,
            parentName: child.parentName,
            phoneNumber: child.phoneNumber,
            address: child.address,
            grade: child.grade,
            avatar: child.avatar
          }
        })
        return { code: 0 }
      }

      // ===== 删除儿童 =====
      case 'remove': {
        const { id } = event
        const exist = await db.collection('children').doc(id).get()
        if (!exist.data || exist.data._openid !== openid) {
          return { code: -1, msg: '无权删除该儿童信息' }
        }
        await db.collection('children').doc(id).remove()
        return { code: 0 }
      }

      default:
        return { code: -1, msg: '未知操作: ' + action }
    }
  } catch (err) {
    console.error('[children] 云函数异常:', err)
    return { code: -1, msg: '服务器错误: ' + (err.message || '未知错误') }
  }
}
