// pages/attendance-admin/attendance-admin.js
// 老师端考勤：口令登录 → 选课程 → 查看该课已预约儿童 → 标记到/缺/迟 + 写反馈
const app = getApp()

// 课程目录：id 必须与预约系统一致（仅用于老师选择，名称仅供展示）
const COURSES = [
  { id: 1, name: '税启新知——税收课堂开班典礼' },
  { id: 2, name: '个人所得税小课堂：爸爸妈妈的工资去哪了' },
  { id: 3, name: '资源税——地球的"守护税"' },
  { id: 4, name: '粘土筑童趣——创意粘土DIY课堂' },
  { id: 5, name: '小小税收家——生活中隐形的小税费' },
  { id: 6, name: '听见旋律里的心情——音乐情感表达探秘趣味课' },
  { id: 7, name: '税收与公共服务——钱去哪儿了？' },
  { id: 8, name: '发票大揭秘 生活寻税行' },
  { id: 9, name: '税收嘉年华・闯关大冒险' },
  { id: 10, name: '童心绘税 知行同行' }
]

Page({
  data: {
    isTeacher: false,
    password: '',
    courses: COURSES,
    courseIndex: 0,
    selectedCourseId: '',
    selectedCourseName: '',
    students: [],
    loading: false
  },

  onLoad() {
    const cached = wx.getStorageSync('teacherToken')
    if (cached) {
      this.setData({ isTeacher: true })
    }
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  // 校验老师口令
  onLogin() {
    const pwd = this.data.password
    if (!pwd) {
      wx.showToast({ title: '请输入口令', icon: 'none' })
      return
    }
    wx.showLoading({ title: '验证中' })
    wx.cloud.callFunction({
      name: 'attendance',
      data: { action: 'verify', password: pwd }
    }).then(res => {
      wx.hideLoading()
      if (res.result && res.result.code === 0) {
        wx.setStorageSync('teacherToken', pwd)
        this.setData({ isTeacher: true })
      } else {
        wx.showModal({
          title: '验证失败',
          content: (res.result && res.result.msg) || '口令错误',
          showCancel: false
        })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showModal({ title: '网络错误', content: String(err), showCancel: false })
    })
  },

  // 选择课程后加载该课已预约儿童 + 已考勤记录
  onCourseChange(e) {
    const idx = parseInt(e.detail.value)
    const c = this.data.courses[idx]
    this.setData({
      courseIndex: idx,
      selectedCourseId: c.id,
      selectedCourseName: c.name
    })
    this.loadStudents(c.id, c.name)
  },

  loadStudents(courseId, courseName) {
    this.setData({ loading: true })
    const password = wx.getStorageSync('teacherToken') || this.data.password
    // 1. 取该课程预约名单（childId + childName）
    wx.cloud.callFunction({
      name: 'reservation',
      data: { action: 'courseList', courseId: parseInt(courseId) }
    }).then(res => {
      let list = []
      if (res.result && res.result.code === 0) {
        list = (res.result.data || []).map(r => ({
          childId: r.childId,
          childName: r.childName || '未命名儿童'
        }))
      }
      // 2. 取已考勤记录，预填状态与反馈
      return wx.cloud.callFunction({
        name: 'attendance',
        data: { action: 'listByCourse', courseId: parseInt(courseId), password }
      }).then(attRes => {
        const attMap = {}
        if (attRes.result && attRes.result.code === 0) {
          ;(attRes.result.data || []).forEach(a => { attMap[a.childId] = a })
        }
        const students = list.map(s => {
          const a = attMap[s.childId] || {}
          return {
            childId: s.childId,
            childName: s.childName,
            status: a.status || '',
            feedback: a.feedback || ''
          }
        })
        this.setData({ students, loading: false })
      })
    }).catch(err => {
      this.setData({ loading: false })
      wx.showModal({ title: '加载失败', content: String(err), showCancel: false })
    })
  },

  // 标记考勤状态（已到课/迟到/缺勤），仅本地暂存，保存时统一提交
  onStatusTap(e) {
    const { childId, status } = e.currentTarget.dataset
    const students = this.data.students.map(s => {
      if (s.childId === childId) return Object.assign({}, s, { status })
      return s
    })
    this.setData({ students })
  },

  onFeedbackInput(e) {
    const childId = e.currentTarget.dataset.childId
    const students = this.data.students.map(s => {
      if (s.childId === childId) return Object.assign({}, s, { feedback: e.detail.value })
      return s
    })
    this.setData({ students })
  },

  // 保存考勤（逐条 upsert，带老师口令校验）
  onSave() {
    const { selectedCourseId, selectedCourseName, students } = this.data
    if (!selectedCourseId) {
      wx.showToast({ title: '请先选择课程', icon: 'none' })
      return
    }
    if (students.length === 0) {
      wx.showToast({ title: '该课程暂无预约儿童', icon: 'none' })
      return
    }
    wx.showLoading({ title: '保存中' })
    const pwd = wx.getStorageSync('teacherToken') || this.data.password
    let done = 0
    let hasError = false
    students.forEach(s => {
      wx.cloud.callFunction({
        name: 'attendance',
        data: {
          action: 'mark',
          password: pwd,
          courseId: parseInt(selectedCourseId),
          courseName: selectedCourseName,
          childId: s.childId,
          childName: s.childName,
          status: s.status || 'present',
          feedback: s.feedback || ''
        }
      }).then(res => {
        if (!res.result || res.result.code !== 0) hasError = true
      }).catch(() => { hasError = true }).then(() => {
        done++
        if (done === students.length) {
          wx.hideLoading()
          wx.showToast({
            title: hasError ? '部分保存失败' : '考勤已保存',
            icon: hasError ? 'none' : 'success'
          })
        }
      })
    })
  }
})
