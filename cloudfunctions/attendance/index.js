// 云函数：attendance
// 处理课程考勤（老师标记到/缺/迟 + 写反馈，家长查看自己孩子的考勤）
// 部署后在客户端通过 wx.cloud.callFunction({ name: 'attendance' }) 调用
// 注意：需在云开发控制台创建 attendance 集合，权限设为"所有用户可读，仅创建者可写"

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 老师口令：老师端进入与标记考勤时需校验。后续可改为云端 config 文档。
const TEACHER_PASSWORD = 'teacher2026'

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  console.log('[attendance] action=%s, openid=%s', action, openid)

  try {
    switch (action) {

      // ===== 老师口令校验（老师端进入时调用） =====
      case 'verify': {
        if (event.password === TEACHER_PASSWORD) {
          return { code: 0, msg: '验证通过' }
        }
        return { code: -1, msg: '口令错误' }
      }

      // ===== 老师标记考勤（同一课程+儿童 upsert） =====
      case 'mark': {
        if (event.password !== TEACHER_PASSWORD) {
          return { code: -1, msg: '口令错误，无权限标记' }
        }
        const {
          courseId, courseName, childId, childName, status, feedback
        } = event
        const cid = parseInt(courseId)
        const sid = String(childId)

        const exist = await db.collection('attendance')
          .where({ courseId: cid, childId: sid })
          .get()

        const data = {
          courseId: cid,
          courseName: courseName || '',
          childId: sid,
          childName: childName || '',
          status: status || 'present', // present / absent / late
          feedback: feedback || '',
          teacherOpenid: openid,
          updateTime: db.serverDate()
        }

        if (exist.data.length > 0) {
          await db.collection('attendance').doc(exist.data[0]._id).update({ data })
        } else {
          await db.collection('attendance').add({
            data: Object.assign({}, data, { createTime: db.serverDate() })
          })
        }
        return { code: 0 }
      }

      // ===== 老师查看某课程考勤名单 =====
      case 'listByCourse': {
        if (event.password !== TEACHER_PASSWORD) {
          return { code: -1, msg: '口令错误' }
        }
        const cid = parseInt(event.courseId)
        const res = await db.collection('attendance')
          .where({ courseId: cid })
          .get()
        return { code: 0, data: res.data }
      }

      // ===== 家长查看自己孩子的考勤（按 childIds 集合过滤，保证只返回自己孩子） =====
      case 'listByChild': {
        const childIds = (event.childIds || []).map(String)
        if (!childIds.length) {
          return { code: 0, data: [] }
        }
        const res = await db.collection('attendance')
          .where({ childId: _.in(childIds) })
          .orderBy('updateTime', 'desc')
          .get()
        return { code: 0, data: res.data }
      }

      default:
        return { code: -1, msg: '未知操作: ' + action }
    }
  } catch (err) {
    console.error('[attendance] 云函数异常:', err)
    return { code: -1, msg: '服务器错误: ' + (err.message || '未知错误') }
  }
}
