// pages/tweet-detail/tweet-detail.js
const app = getApp()
const { getTweetContent } = require('../../utils/tweetContents')

Page({
  data: {
    id: '',
    title: '',
    cover: '',
    summary: '',
    blocks: [],      // [{ type: 'text', text } | { type: 'image', src }]
    link: ''
  },

  onLoad(options) {
    const id = options.id
    const local = getTweetContent(id)

    if (local) {
      const blocks = (local.blocks || []).map(b => {
        if (typeof b === 'string') return { type: 'text', text: b }
        return b
      })
      this.setData({
        id: id,
        title: local.title,
        cover: local.cover,
        summary: local.summary || '',
        blocks: blocks,
        link: local.link || ''
      })
      wx.setNavigationBarTitle({ title: local.title })
      return
    }

    // 后端返回的推文在本地没有正文：用参数兜底，提供"查看原文"入口
    const title = decodeURIComponent(options.title || '推文详情')
    const cover = decodeURIComponent(options.image || '')
    const link = decodeURIComponent(options.link || '')
    this.setData({
      id: id,
      title: title,
      cover: cover,
      summary: '',
      blocks: [{ type: 'text', text: '该推文暂未收录正文内容，点击下方按钮可查看原文。' }],
      link: link
    })
    wx.setNavigationBarTitle({ title: title })
  },

  copyLink() {
    if (!this.data.link) return
    wx.setClipboardData({
      data: this.data.link,
      success: () => {
        wx.showModal({
          title: '链接已复制',
          content: '已复制原文链接，可在微信或浏览���中打开查看。',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  }
})
