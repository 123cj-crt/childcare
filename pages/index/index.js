// pages/index/index.js
// === 调试模式：无服务器时使用 mock 数据 ===
// 正式上线后把 DEBUG_MOCK_DATA 改成 false

const app = getApp()

// 调试开关
const DEBUG_MOCK_DATA = true

// 云开发预约开关：true = 预约人数走云数据库实时同步
const USE_CLOUD_RESERVATION = true

// mock 数据
const MOCK_BANNERS = [
  { id: 1, image: '/images/1.jpg', title: '智慧托育中心', link: 'https://m.jyrmt.com/mob/2025/0831/83206.html?isDM=1&t=3730' },
  { id: 2, image: '/images/2.jpg', title: '税理奇妙课堂', link: 'https://mp.weixin.qq.com/s/hsGNAtJXbq6wHB2jQI4yBQ' },
  { id: 3, image: '/images/3.jpg', title: '财税启蒙之旅', link: 'https://mp.weixin.qq.com/s/uL6q4FX0CuAjtSXkCGz2cg' }
]

// 2026年8月10-14日课程安排
const MOCK_COURSES = [
  {
    id: 1,
    name: '税启新知——税收课堂开班典礼',
    date: '8月10日',
    weekday: '周一',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '为响应国家"税收普法从青少年抓起"的号召，依托专业所学为青少年打造趣味税收小课堂。活动以生活化科普代替条文讲解，引导小朋友发现生活里的税收，首场授课既是公益教学的落地开端，也为分阶段科普基础税种知识做好铺垫。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 15,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 2,
    name: '个人所得税小课堂：爸爸妈妈的工资去哪了',
    date: '8月10日',
    weekday: '周一',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '个人所得税是与每个家庭最直接相关的税种。本课程通过工资条、家庭生活等孩子熟悉的场景，将抽象的税收概念转化为生活常识，帮助孩子理解"公民义务"，体会税收与日常生活的紧密联系。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 18,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 3,
    name: '资源税——地球的"守护税"',
    date: '8月11日',
    weekday: '周二',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '我们每天用的电、水、汽油，甚至铅笔、书本，都来自地球上的自然资源。国家通过征收"资源税"，让开采资源的人多付一些钱，用来保护环境、寻找新能源。小朋友了解资源税，就能更懂为什么要节约用水、随手关灯。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 12,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 4,
    name: '粘土筑童趣——创意粘土DIY课堂',
    date: '8月11日',
    weekday: '周二',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '为丰富托管服务形式、劳逸结合、缓解孩子们课堂学习疲劳，在系列财税科普课堂之余开设趣味手工拓展课程，依托超轻粘土开展美育实践活动。孩子们可以在动手创作中锻炼动手能力、想象力与专注力。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 20,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 5,
    name: '小小税收家——生活中隐形的小税费',
    date: '8月12日',
    weekday: '周三',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '在日常衣食住行、买房购车中，多种税费默默影响城市建设与公共配套。车辆购置税、契税、房产税、城建税及教育费附加和买车、买房、城市基建息息相关。本次课程拆解四种税费的由来、用途与征收，让孩子看懂花钱买房买车时的隐形税收。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 14,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 6,
    name: '听见旋律里的心情——音乐情感表达探秘趣味课',
    date: '8月12日',
    weekday: '周三',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '以趣味互动、游戏闯关、创意实践为核心，带领学生聆听不同风格的音乐，探索音乐与情绪之间的关联，在轻松欢乐的氛围中提升音乐感知力与审美素养。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 22,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 7,
    name: '税收与公共服务——钱去哪儿了？',
    date: '8月13日',
    weekday: '周四',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '孩子们已经知道买东西要交税，但交上去的税到底去了哪里？本课从孩子最熟悉的公共设施入手，带领他们发现税收如何变成身边的公共服务，理解"取之于民，用之于民"。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 16,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 8,
    name: '发票大揭秘 生活寻税行',
    date: '8月13日',
    weekday: '周四',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '以生活化认知为核心，以孩子看得见、摸得着的消费场景和发票实例为切入点，结合真实生活案例讲解税收的来源与用途，让学生在真实、趣味、直观的课堂体验中读懂税收、理解税收。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 13,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 9,
    name: '税收嘉年华・闯关大冒险',
    date: '8月14日',
    weekday: '周五',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '孩子们已系统学习税收基础概念及核心税种知识，通过沉浸式趣味实践巩固学习成果。本次游园会以闯关集章形式，保留经典互动项目并创新内容设计，让孩子们在游戏中深化对税收知识的理解。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 25,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 10,
    name: '童心绘税 知行同行',
    date: '8月14日',
    weekday: '周五',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '为帮助大家系统回顾课堂知识、加深学习印象，进一步把所学内容和生活实物对应结合，特开展本次总结提升课。课程延续趣味互动形式，以绘画、小游戏为主，在轻松的氛围中梳理知识点，巩固学习成果。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 19,
    teacher: '小明',
    teacherPhone: '666666'
  }
]

Page({
  data: {
    banners: [],
    courses: []
  },

  // 防止过期云函数响应覆盖当前数据
  _cloudCountReqId: 0,

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 只在有缓存时刷新人数，不重置整个列表，避免明显跳动
    if (USE_CLOUD_RESERVATION && DEBUG_MOCK_DATA) {
      this.fetchCloudCounts()
    }
  },

  loadData() {
    if (DEBUG_MOCK_DATA) {
      // 先读本地缓存的真实人数，避免先显示 mock 默认值再跳变
      const cachedCounts = wx.getStorageSync('cloud_course_counts') || {}
      const courses = MOCK_COURSES.map(c => ({
        ...c,
        currentStudents: cachedCounts[c.id] !== undefined ? cachedCounts[c.id] : c.currentStudents
      }))
      this.setData({
        banners: MOCK_BANNERS,
        courses: courses
      })
      // 云开发模式：批量查每门课的实时预约人数
      if (USE_CLOUD_RESERVATION) {
        this.fetchCloudCounts()
      }
      return
    }

    this.fetchBanners()
    this.fetchCourses()
  },

  // 云开发：批量查每门课的实时预约人数（跨用户共享）
  fetchCloudCounts() {
    const courseIds = MOCK_COURSES.map(c => c.id)
    const reqId = ++this._cloudCountReqId
    wx.cloud.callFunction({
      name: 'reservation',
      data: { action: 'batchCount', courseIds: courseIds }
    }).then(res => {
      // 忽略过期请求的结果
      if (reqId !== this._cloudCountReqId) return
      if (res.result && res.result.code === 0) {
        const counts = res.result.data || {}
        // 缓存到本地，下次进入页面时先显示缓存值，避免跳动
        wx.setStorageSync('cloud_course_counts', counts)
        const courses = this.data.courses.map(c => ({
          ...c,
          currentStudents: counts[c.id] !== undefined ? counts[c.id] : c.currentStudents
        }))
        this.setData({ courses })
      }
    }).catch(err => {
      console.error('[云开发] 批量查询预约人数失败', err)
    })
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
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/tweets`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId || ''
      },
      success: (res) => {
        console.log('===== 首页 fetchBanners 响应 =====', res)
        if (res.statusCode === 200) {
          const raw = res.data
          let list = []
          if (Array.isArray(raw)) {
            list = raw
          } else if (raw && Array.isArray(raw.data)) {
            list = raw.data
          }
          if (list.length > 0) {
            this.setData({
              banners: list.map((tweet, i) => ({
                id: tweet.id || i + 1,
                image: this.processImageUrl(tweet.image),
                title: tweet.title || `推文 ${tweet.id}`,
                link: tweet.link
              }))
            })
            return
          }
        }
        this.setData({ banners: [] })
      },
      fail: () => {
        this.setData({ banners: [] })
      }
    })
  },

  fetchCourses() {
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/courses`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId || ''
      },
      success: (res) => {
        console.log('===== 首页 fetchCourses 响应 =====', res)
        if (res.statusCode === 200) {
          const raw = res.data
          let list = []
          if (Array.isArray(raw)) {
            list = raw
          } else if (raw && Array.isArray(raw.data)) {
            list = raw.data
          }
          if (list.length > 0) {
            this.setData({ courses: list })
            return
          }
        }
        this.setData({ courses: [] })
      },
      fail: () => {
        this.setData({ courses: [] })
      }
    })
  }
})
