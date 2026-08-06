// pages/course-reservations/course-reservations.js
// 课程预约名单管理页面（管理用）
// 选择课程 → 调云函数查该课所有预约人

// 课程列表（与首页 MOCK_COURSES 保持一致）
const COURSES = [
  { id: 1, name: '税启新知——税收课堂开班典礼', date: '8月10日', weekday: '周一', time: '09:00-11:00', capacity: 40 },
  { id: 2, name: '个人所得税小课堂：爸爸妈妈的工资去哪了', date: '8月10日', weekday: '周一', time: '15:00-17:00', capacity: 40 },
  { id: 3, name: '资源税——地球的"守护税"', date: '8月11日', weekday: '周二', time: '09:00-11:00', capacity: 40 },
  { id: 4, name: '粘土筑童趣——创意粘土DIY课堂', date: '8月11日', weekday: '周二', time: '15:00-17:00', capacity: 40 },
  { id: 5, name: '小小税收家——生活中隐形的小税费', date: '8月12日', weekday: '周三', time: '09:00-11:00', capacity: 40 },
  { id: 6, name: '关税大冒险——国际贸易小旅行', date: '8月12日', weekday: '周三', time: '15:00-17:00', capacity: 40 },
  { id: 7, name: '环保税——守护蓝天绿水', date: '8月13日', weekday: '周四', time: '09:00-11:00', capacity: 40 },
  { id: 8, name: '税收创意坊——手绘税收海报', date: '8月13日', weekday: '周四', time: '15:00-17:00', capacity: 40 },
  { id: 9, name: '税收辩论赛——小小公民大讨论', date: '8月14日', weekday: '周五', time: '09:00-11:00', capacity: 40 },
  { id: 10, name: '结营典礼与颁奖——税收小达人', date: '8月14日', weekday: '周五', time: '15:00-17:00', capacity: 40 }
]

Page({
  data: {
    courses: COURSES,
    courseNames: COURSES.map(c => c.name),
    selectedIndex: 0,
    selectedCourse: COURSES[0],
    reservations: [],
    loading: false,
    isEmpty: false
  },

  onLoad() {
    this.loadReservations(COURSES[0].id)
  },

  // 选择课程
  onCourseChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      selectedIndex: index,
      selectedCourse: COURSES[index]
    })
    this.loadReservations(COURSES[index].id)
  },

  // 查询某课程的所有预约名单
  loadReservations(courseId) {
    this.setData({ loading: true, isEmpty: false, reservations: [] })

    wx.cloud.callFunction({
      name: 'reservation',
      data: { action: 'courseList', courseId: courseId }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        const list = res.result.data || []
        this.setData({
          reservations: list,
          isEmpty: list.length === 0,
          loading: false
        })
      } else {
        this.setData({ loading: false, isEmpty: true })
        wx.showToast({ title: '查询失败', icon: 'none' })
      }
    }).catch(err => {
      console.error('[课程预约名单] 查询失败', err)
      this.setData({ loading: false, isEmpty: true })
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  // 刷新
  onRefresh() {
    this.loadReservations(this.data.selectedCourse.id)
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
