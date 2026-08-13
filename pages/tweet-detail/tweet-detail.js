// pages/tweet-detail/tweet-detail.js
const app = getApp()
const { getTweetContent } = require('../../utils/tweetContents')

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = n => (n < 10 ? '0' + n : '' + n)
  return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

Page({
  data: {
    id: '',
    title: '',
    cover: '',
    link: '',
    // 后端真实正文（HTML 富文本）
    hasContent: false,
    contentHtml: '',
    contentBlocks: [],
    imageList: [],
    // 降级用的本地正文
    summary: '',
    blocks: [],
    // 点赞
    liked: false,
    likeCount: 0,
    likeLoading: false,
    // 评论
    comments: [],
    commentCount: 0,
    commentContent: '',
    commentNick: '',
    commentLoading: false
  },

  onLoad(options) {
    const id = options.id
    const local = getTweetContent(id)

    // 基本信息：优先用跳转参数，缺失用本地补
    const title = decodeURIComponent(options.title || '') || (local ? local.title : '推文详情')
    const cover = decodeURIComponent(options.image || '') || (local ? local.cover : '')
    const link = decodeURIComponent(options.link || '') || (local ? local.link : '')

    this.setData({ id, title, cover, link })
    wx.setNavigationBarTitle({ title })

    // 初始化评论昵称
    const info = wx.getStorageSync('userInfo') || {}
    this.setData({ commentNick: info.nickName || '家长' })

    // 加载点赞状态与评论列表
    this.loadInteraction(id)
    // 加载正文：后端 content 优先，本地占位兜底
    this.loadContent(id)
  },

  // 加载正文：后端 content 优先，本地兜底
  loadContent(id) {
    // 1) 先查首页缓存（含后端 content）
    const cache = (app.globalData && app.globalData.tweetsCache) || []
    const fromCache = cache.find(t => String(t.id) === String(id))
    if (fromCache && fromCache.content) {
      const parsed = this.parseContent(fromCache.content)
      this.setData({ hasContent: true, contentHtml: fromCache.content, contentBlocks: parsed.blocks, imageList: parsed.images })
      return
    }
    // 2) 缓存没有，自己拉后端列表找对应 id
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/tweets`,
      method: 'GET',
      timeout: 10000,
      header: { 'content-type': 'application/json', 'X-WX-OPENID': openId || '' },
      success: (res) => {
        const raw = res.data
        const list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.data) ? raw.data : [])
        const item = list.find(t => String(t.id) === String(id))
        if (item && item.content) {
          const parsed = this.parseContent(item.content)
          this.setData({ hasContent: true, contentHtml: item.content, contentBlocks: parsed.blocks, imageList: parsed.images })
        } else {
          this.fallbackLocal(id)
        }
      },
      fail: () => this.fallbackLocal(id)
    })
  },

  // 将后端 content HTML 拆分为文本块 + 图片块
  parseContent(html) {
    if (!html) return { blocks: [], images: [] }
    const images = []
    // 先替换被 <p>...</p> 包裹的图片（整段替换成标记，避免拆坏标签）
    const marked = html.replace(/<p[^>]*>\s*<img[^>]*src=["']([^"']+)["'][^>]*>\s*<\/p>/gi, (match, src) => {
      images.push(src)
      return `###IMG{${src}}###`
    })
    // 兜底：处理未包裹的裸 <img>
    const marked2 = marked.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
      if (!images.includes(src)) images.push(src)
      return `###IMG{${src}}###`
    })
    const parts = marked2.split(/###IMG\{([^}]+)\}###/)
    const blocks = []
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i % 2 === 0) {
        const trimmed = part.trim()
        if (trimmed) blocks.push({ type: 'text', html: trimmed })
      } else {
        blocks.push({ type: 'image', src: part })
      }
    }
    return { blocks, images }
  },

  // 点击图片放大预览
  previewImage(e) {
    const { src, list } = e.currentTarget.dataset
    wx.previewImage({
      current: src,
      urls: list && list.length ? list : [src]
    })
  },

  // 降级：用本地 tweetContents.js 占位正文
  fallbackLocal(id) {
    const local = getTweetContent(id)
    if (local) {
      const blocks = (local.blocks || []).map(b => (typeof b === 'string' ? { type: 'text', text: b } : b))
      const imageList = blocks.filter(b => b.type === 'image').map(b => b.src)
      this.setData({ summary: local.summary || '', blocks, imageList, hasContent: false })
    } else {
      this.setData({
        summary: '',
        blocks: [{ type: 'text', text: '该推文暂未收录正文内容。' }],
        imageList: [],
        hasContent: false
      })
    }
  },

  // 加载点赞状态 + 评论列表
  loadInteraction(id) {
    wx.cloud.callFunction({
      name: 'tweet-interaction',
      data: { action: 'getStatus', tweetId: id }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        this.setData({ liked: res.result.liked, likeCount: res.result.count })
      }
    }).catch(err => console.error('[tweet-interaction] getStatus fail', err))

    wx.cloud.callFunction({
      name: 'tweet-interaction',
      data: { action: 'listComments', tweetId: id }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        const comments = (res.result.data || []).map(c => ({
          ...c,
          timeText: formatTime(c.createTime)
        }))
        this.setData({ comments: comments, commentCount: comments.length })
      }
    }).catch(err => console.error('[tweet-interaction] listComments fail', err))
  },

  // 点赞 / 取消点赞
  toggleLike() {
    if (this.data.likeLoading) return
    this.setData({ likeLoading: true })
    wx.cloud.callFunction({
      name: 'tweet-interaction',
      data: { action: 'like', tweetId: this.data.id }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        this.setData({ liked: res.result.liked, likeCount: res.result.count })
      } else {
        wx.showToast({ title: (res.result && res.result.msg) || '操作失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('[tweet-interaction] like fail', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      this.setData({ likeLoading: false })
    })
  },

  onCommentInput(e) {
    this.setData({ commentContent: e.detail.value })
  },

  onNickInput(e) {
    this.setData({ commentNick: e.detail.value })
  },

  // 发布评论
  submitComment() {
    const content = (this.data.commentContent || '').trim()
    if (!content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }
    if (this.data.commentLoading) return
    this.setData({ commentLoading: true })
    wx.cloud.callFunction({
      name: 'tweet-interaction',
      data: {
        action: 'addComment',
        tweetId: this.data.id,
        nickName: (this.data.commentNick || '家长').trim() || '家长',
        content: content
      }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        wx.showToast({ title: '评论成功', icon: 'success' })
        this.setData({ commentContent: '' })
        this.loadInteraction(this.data.id)
      } else {
        wx.showToast({ title: (res.result && res.result.msg) || '评论失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('[tweet-interaction] addComment fail', err)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }).finally(() => {
      this.setData({ commentLoading: false })
    })
  },

  // 复制原文链接（仅降级场景使用）
  copyLink() {
    if (!this.data.link) return
    wx.setClipboardData({
      data: this.data.link,
      success: () => {
        wx.showModal({
          title: '链接已复制',
          content: '已复制原文链接，可在微信或浏览器中打开查看。',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  }
})
