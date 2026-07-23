// pages/index/index.js
// === 调试模式：无服务器时使用 mock 数据 ===
// 正式上线后把 DEBUG_MOCK_DATA 改成 false

const app = getApp()

// 调试开关
const DEBUG_MOCK_DATA = true

// mock 数据
const MOCK_BANNERS = [
  { id: 1, image: '/images/1.jpg', title: '智慧托育中心', link: '' },
  { id: 2, image: '/images/2.jpg', title: '育儿专家分享', link: '' },
  { id: 3, image: '/images/3.jpg', title: '最新活动资讯', link: '' }
]

const MOCK_COURSES = [
  {
    id: 1,
    name: '创意美术课',
    startDate: '2024-01-15',
    schedule: '周一 09:00-10:30',
    description: '培养孩子的艺术创造力和审美能力，通过绘画、手工等方式激发想象力。',
    price: 120,
    maxStudents: 15,
    currentStudents: 8
  },
  {
    id: 2,
    name: '音乐启蒙课',
    startDate: '2024-01-16',
    schedule: '周二 14:00-15:30',
    description: '通过音乐游戏、节奏训练等方式，培养孩子的音乐感知能力和协调性。',
    price: 100,
    maxStudents: 12,
    currentStudents: 10
  },
  {
    id: 3,
    name: '科学探索课',
    startDate: '2024-01-17',
    schedule: '周三 10:00-11:30',
    description: '通过有趣的科学实验，培养孩子的好奇心和探索精神，学习基础科学知识。',
    price: 150,
    maxStudents: 10,
    currentStudents: 6
  },
  {
    id: 4,
    name: '运动体能课',
    startDate: '2024-01-18',
    schedule: '周四 15:00-16:30',
    description: '通过各种运动游戏和体能训练，增强孩子的身体素质和协调能力。',
    price: 80,
    maxStudents: 20,
    currentStudents: 15
  }
]

Page({
  data: {
    banners: [],
    courses: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    if (DEBUG_MOCK_DATA) {
      // 调试模式：直接用 mock 数据
      this.setData({
        banners: MOCK_BANNERS,
        courses: MOCK_COURSES
      })
      return
    }

    // 正式版：从服务器加载
    this.fetchBanners()
    this.fetchCourses()
  },

  goToCourseDetail(e) {
    const courseId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    })
  },

  onBannerTap(e) {
    const link = e.currentTarget.dataset.link
    const title = e.currentTarget.dataset.title

    if (!link) {
      wx.showToast({ title: '推文链接不存在', icon: 'none' })
      return
    }

    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title || '微信公众号推文')}`,
      fail: () => {
        wx.setClipboardData({
          data: link,
          success: () => {
            wx.showModal({
              title: '链接已复制',
              content: '已复制推文链接到剪贴板，请在微信中打开查看。',
              showCancel: false,
              confirmText: '知道了'
            })
          }
        })
      }
    })
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index
    const banners = this.data.banners
    if (banners[index]) {
      banners[index].image = '/images/1.jpg'
      this.setData({ banners })
    }
  },

  processImageUrl(imageUrl) {
    if (!imageUrl) return '/images/1.jpg'
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
    return `${app.globalData.API_BASE_URL}${imageUrl}`
  },

  fetchBanners() {
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/tweets`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
          this.setData({
            banners: res.data.map((tweet, i) => ({
              id: tweet.id || i + 1,
              image: this.processImageUrl(tweet.image),
              title: tweet.title || `推文 ${tweet.id}`,
              link: tweet.link
            }))
          })
        } else {
          this.setData({ banners: [] })
        }
      },
      fail: () => {
        this.setData({ banners: [] })
      }
    })
  },

  fetchCourses() {
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/courses`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.length > 0) {
          this.setData({ courses: res.data })
        } else {
          this.setData({ courses: [] })
        }
      },
      fail: () => {
        this.setData({ courses: [] })
      }
    })
  }
})
