// pages/notice-detail/notice-detail.js
const app = getApp()

// ========== 调试模式 ==========
const DEBUG_MOCK_NOTICES = false
// =================================

// 内置公告详情内容
const NOTICE_CONTENTS = {
  'guide_001': {
    id: 'guide_001',
    title: '小程序使用指南',
    time: '2026-07-31',
    icon: '📖',
    color: '#4a90d9',
    tag: '使用指南',
    sections: [
      {
        step: '01',
        title: '登录账号',
        desc: '打开小程序后，点击底部「我的」页面，完成登录后即可使用全部功能。',
        tips: ['首次使用请先登录', '登录信息会自动保存']
      },
      {
        step: '02',
        title: '绑定儿童信息',
        desc: '在「我的」页面点击「绑定儿童」，填写孩子的姓名、年龄、性别及家长联系方式。',
        tips: ['每位儿童需单独添加', '支持添加多个孩子', '信息填写后可在详情页修改']
      },
      {
        step: '03',
        title: '浏览课程',
        desc: '首页展示最新课程安排，包含课程名称、日期、时间、地点及报名人数。点击课程卡片可查看详细介绍。',
        tips: ['课程详情页可查看教师信息', '点击电话可直接拨打老师电话', '实时显示剩余名额']
      },
      {
        step: '04',
        title: '预约课程',
        desc: '在课程详情页点击「预约课程」，选择要参加的孩子（可多选），确认后即可完成预约。',
        tips: ['同一课程可为多个孩子分别预约', '可随时增加或取消某位孩子的预约', '课程人数满员后无法继续预约']
      },
      {
        step: '05',
        title: '查看我的预约',
        desc: '在「我的」→「我的预约课程」中，可查看所有已预约的课程，支持取消预约。',
        tips: ['显示为哪位孩子预约的课程', '课程信息一目了然', '一键取消不用的预约']
      },
      {
        step: '06',
        title: '查看课表',
        desc: '点击底部「课表」Tab，系统会按孩子自动分组，每位孩子的课程独立排列。',
        tips: ['课程按日期自动排序', '点击课程可跳转详情', '三种状态：有课/无课/未绑定']
      },
      {
        step: '07',
        title: '阅读推文资讯',
        desc: '首页顶部轮播图展示最新推文资讯，点击即可查看相关文章内容。',
        tips: ['了解中心最新动态', '获取育儿科普知识']
      }
    ]
  },
  'guide_002': {
    id: 'guide_002',
    title: '2026年暑期税收科普课程安排',
    time: '2026-07-30',
    icon: '📚',
    color: '#e6a23c',
    tag: '课程安排',
    sections: [
      {
        step: '1',
        title: '8月10日（周一）',
        desc: '上午 09:00-11:00：税启新知——税收课堂开班典礼\n下午 15:00-17:00：个人所得税小课堂：爸爸妈妈的工资去哪了',
        tips: ['地点：广东省江门市鹤山市沙坪街道新升社区', '授课教师：小明']
      },
      {
        step: '2',
        title: '8月11日（周二）',
        desc: '上午 09:00-11:00：资源税——地球的"守护税"\n下午 15:00-17:00：粘土筑童趣——创意粘土DIY课堂',
        tips: ['地点：广东省江门市鹤山市沙坪街道新升社区', '授课教师：小明', '每节课容量40人']
      },
      {
        step: '3',
        title: '8月12日（周三）',
        desc: '上午 09:00-11:00：小小税收家——生活中隐形的小税费\n下午 15:00-17:00：听见旋律里的心情——音乐情感表达探秘趣味课',
        tips: ['地点：广东省江门市鹤山市沙坪街道新升社区', '授课教师：小明']
      },
      {
        step: '4',
        title: '8月13日（周四）',
        desc: '上午 09:00-11:00：税收与公共服务——钱去哪儿了？\n下午 15:00-17:00：发票大揭秘 生活寻税行',
        tips: ['地点：广东省江门市鹤山市沙坪街道新升社区', '授课教师：小明']
      },
      {
        step: '5',
        title: '8月14日（周五）',
        desc: '上午 09:00-11:00：税收嘉年华・闯关大冒险\n下午 15:00-17:00：童心绘税 知行同行',
        tips: ['地点：广东省江门市鹤山市沙坪街道新升社区', '授课教师：小明', '课程完结总结']
      }
    ]
  }
}

Page({
  data: {
    notice: null
  },

  onLoad(options) {
    const id = options.id
    this.loadNoticeDetail(id)
  },

  loadNoticeDetail(id) {
    // 优先从用户隔离存储读取公告列表
    const notices = app.getUserStorage('notice_announcements') || []
    const notice = notices.find(n => String(n.id) === String(id))

    // 本地内置了完整正文（sections）的公告，用内置内容兜底/补全，
    // 避免后端/storage 数据缺少 sections 导致详情页空白
    if (NOTICE_CONTENTS[id]) {
      this.setData({
        notice: { ...NOTICE_CONTENTS[id], ...(notice || {}) }
      })
      wx.setNavigationBarTitle({ title: NOTICE_CONTENTS[id].title })
      return
    }

    if (notice) {
      this.setData({ notice })
      wx.setNavigationBarTitle({ title: notice.title || '公告详情' })
    }
  }
})
