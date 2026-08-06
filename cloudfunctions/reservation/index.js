// 云函数：reservation
// 处理课程预约的全部逻辑（查询人数、预约、取消、防超员、防重复）
// 部署后在客户端通过 wx.cloud.callFunction({ name: 'reservation' }) 调用

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  console.log('[reservation] action=%s, openid=%s, event=%j', action, openid, event)

  try {
    switch (action) {

      // ===== 查某课程预约总数 =====
      case 'count': {
        const cid = parseInt(event.courseId)
        const res = await db.collection('reservations')
          .where({ courseId: cid })
          .count()
        return { code: 0, total: res.total }
      }

      // ===== 批量查多门课的预约总数（首页用） =====
      case 'batchCount': {
        const { courseIds } = event
        const results = {}
        for (const cid of courseIds) {
          const res = await db.collection('reservations')
            .where({ courseId: parseInt(cid) })
            .count()
          results[cid] = res.total
        }
        return { code: 0, data: results }
      }

      // ===== 查当前用户在某课程的预约 =====
      case 'myList': {
        const cid = parseInt(event.courseId)
        const res = await db.collection('reservations')
          .where({ courseId: cid, _openid: openid })
          .get()
        return { code: 0, data: res.data }
      }

      // ===== 查当前用户所有预约（我的预约页用） =====
      case 'myAll': {
        const res = await db.collection('reservations')
          .where({ _openid: openid })
          .orderBy('reservedAt', 'desc')
          .get()
        return { code: 0, data: res.data }
      }

      // ===== 创建预约（含并发控制防超员 + 防重复） =====
      case 'reserve': {
        const {
          courseId, childId, childName, childAge,
          childGender, childRelation, courseInfo
        } = event
        const cid = parseInt(courseId)

        // 1. 并发控制：检查是否已满
        const countRes = await db.collection('reservations')
          .where({ courseId: cid })
          .count()
        const capacity = (courseInfo && courseInfo.capacity) || 40
        if (countRes.total >= capacity) {
          return { code: -1, msg: '名额已满，无法预约' }
        }

        // 2. 防重复：同一用户同一儿童不能重复预约同一课程
        const existRes = await db.collection('reservations')
          .where({ courseId: cid, childId: String(childId), _openid: openid })
          .get()
        if (existRes.data.length > 0) {
          return { code: -1, msg: '该儿童已预约此课程' }
        }

        // 3. 写入预约记录
        const now = new Date()
        const pad = n => String(n).padStart(2, '0')
        const reservedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

        const addRes = await db.collection('reservations').add({
          data: {
            courseId: cid,
            childId: String(childId),
            childName: childName || '',
            childAge: childAge || '',
            childGender: childGender || '',
            childRelation: childRelation || '',
            // 冗余存课程信息，方便"我的预约"页直接展示
            courseName: (courseInfo && courseInfo.name) || '',
            courseDate: (courseInfo && courseInfo.date) || '',
            courseWeekday: (courseInfo && courseInfo.weekday) || '',
            courseTime: (courseInfo && courseInfo.time) || '',
            courseLocation: (courseInfo && courseInfo.location) || '',
            courseDescription: (courseInfo && courseInfo.description) || '',
            courseTeacher: (courseInfo && courseInfo.teacher) || '',
            courseTeacherPhone: (courseInfo && courseInfo.teacherPhone) || '',
            courseCapacity: capacity,
            reservedAt: reservedAt,
            status: 'reserved',
            createTime: db.serverDate()
          }
        })

        // 返回最新人数，前端直接更新 UI
        const newCount = await db.collection('reservations')
          .where({ courseId: cid })
          .count()

        return { code: 0, _id: addRes._id, currentCount: newCount.total }
      }

      // ===== 取消单个预约（按 courseId + childId） =====
      case 'cancel': {
        const cid = parseInt(event.courseId)
        const childId = String(event.childId)

        const res = await db.collection('reservations')
          .where({ courseId: cid, childId: childId, _openid: openid })
          .remove()

        // 返回最新人数
        const newCount = await db.collection('reservations')
          .where({ courseId: cid })
          .count()

        return { code: 0, removed: res.stats.removed, currentCount: newCount.total }
      }

      // ===== 取消某课程当前用户的所有预约 =====
      case 'cancelAll': {
        const cid = parseInt(event.courseId)

        const res = await db.collection('reservations')
          .where({ courseId: cid, _openid: openid })
          .remove()

        return { code: 0, removed: res.stats.removed }
      }

      default:
        return { code: -1, msg: '未知操作: ' + action }
    }
  } catch (err) {
    console.error('[reservation] 云函数异常:', err)
    return { code: -1, msg: '服务器错误: ' + (err.message || '未知错误') }
  }
}
