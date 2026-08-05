// pages/schedule/schedule.js
Page({
  data: {
    scheduleGroups: [],
    hasChildren: false,
    hasReservations: false
  },

  onLoad() {
    this.loadSchedule()
  },

  onShow() {
    this.loadSchedule()
  },

  loadSchedule() {
    const myChildren = wx.getStorageSync('myChildren') || []
    let myReservations = wx.getStorageSync('myReservations') || []

    if (!Array.isArray(myReservations)) {
      myReservations = []
    }

    this.setData({
      hasChildren: myChildren.length > 0,
      hasReservations: myReservations.length > 0
    })

    if (myChildren.length === 0 || myReservations.length === 0) {
      this.setData({ scheduleGroups: [] })
      return
    }

    // 按儿童分组
    const groups = myChildren.map(child => {
      const childReservations = myReservations.filter(r =>
        String(r.childId) === String(child.id)
      )

      // 按日期排序（8月10日 → 8月11日 → ...）
      childReservations.sort((a, b) => {
        const dateA = this.parseDate(a.date)
        const dateB = this.parseDate(b.date)
        if (dateA !== dateB) return dateA - dateB
        // 同一天按时间排序
        return (a.time || '').localeCompare(b.time || '')
      })

      return {
        childId: child.id,
        childName: child.name,
        childAge: child.age,
        childGender: child.gender,
        avatarText: child.name ? child.name[0] : '?',
        courses: childReservations.map(r => ({
          courseId: r.courseId,
          courseName: r.courseName,
          date: r.date,
          weekday: r.weekday,
          time: r.time,
          location: r.location,
          teacher: r.teacher
        }))
      }
    }).filter(g => g.courses.length > 0) // 只显示有课的儿童

    this.setData({
      scheduleGroups: groups,
      hasReservations: groups.length > 0
    })
  },

  // 把 "8月10日" 转成可排序的数字 810
  parseDate(dateStr) {
    if (!dateStr) return 0
    const match = dateStr.match(/(\d+)月(\d+)日/)
    if (match) {
      return parseInt(match[1]) * 100 + parseInt(match[2])
    }
    return 0
  },

  // 点击课程跳转到详情
  onCourseTap(e) {
    const courseId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    })
  }
})