// 云函数：tweet-interaction
// 处理推文点赞与评论（防重复点赞、评论发布与列表）
// 部署后在客户端通过 wx.cloud.callFunction({ name: 'tweet-interaction' }) 调用

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action, tweetId } = event

  console.log('[tweet-interaction] action=%s, openid=%s, tweetId=%s', action, openid, tweetId)

  if (!tweetId) {
    return { code: 1, msg: '缺少 tweetId' }
  }

  try {
    switch (action) {

      // ===== 查点赞状态 + 总数 =====
      case 'getStatus': {
        const likeRes = await db.collection('tweet_likes')
          .where({ tweetId, openid })
          .count()
        const totalRes = await db.collection('tweet_likes')
          .where({ tweetId })
          .count()
        return {
          code: 0,
          liked: likeRes.total > 0,
          count: totalRes.total
        }
      }

      // ===== 点赞 / 取消点赞（toggle，云端保证不重复）=====
      case 'like': {
        const existed = await db.collection('tweet_likes')
          .where({ tweetId, openid })
          .get()
        let liked
        if (existed.data.length > 0) {
          // 已赞 -> 取消
          await db.collection('tweet_likes')
            .where({ tweetId, openid })
            .remove()
          liked = false
        } else {
          // 未赞 -> 点赞
          await db.collection('tweet_likes').add({
            data: {
              tweetId,
              openid,
              createTime: db.serverDate()
            }
          })
          liked = true
        }
        const totalRes = await db.collection('tweet_likes')
          .where({ tweetId })
          .count()
        return { code: 0, liked, count: totalRes.total }
      }

      // ===== 发布评论 =====
      case 'addComment': {
        const nickName = (event.nickName || '').trim() || '家长'
        const content = (event.content || '').trim()
        if (!content) {
          return { code: 1, msg: '评论内容不能为空' }
        }
        if (content.length > 200) {
          return { code: 1, msg: '评论内容过长（最多200字）' }
        }
        await db.collection('tweet_comments').add({
          data: {
            tweetId,
            openid,
            nickName,
            content,
            createTime: db.serverDate()
          }
        })
        return { code: 0, msg: 'ok' }
      }

      // ===== 评论列表（按时间正序，旧->新）=====
      case 'listComments': {
        const limit = Math.min(parseInt(event.limit) || 50, 100)
        const res = await db.collection('tweet_comments')
          .where({ tweetId })
          .orderBy('createTime', 'asc')
          .limit(limit)
          .get()
        const toTs = (d) => {
          if (!d) return null
          if (typeof d === 'number') return d
          if (d.$date) return d.$date
          if (d instanceof Date) return d.getTime()
          return null
        }
        const list = res.data.map(c => ({
          _id: c._id,
          nickName: c.nickName,
          content: c.content,
          createTime: toTs(c.createTime)
        }))
        return { code: 0, data: list, total: list.length }
      }

      default:
        return { code: 1, msg: '未知 action: ' + action }
    }
  } catch (err) {
    console.error('[tweet-interaction] error', err)
    return { code: 2, msg: err.message || '服务器错误' }
  }
}
