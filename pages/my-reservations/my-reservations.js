// pages/my-reservations/my-reservations.js
const app = getApp()

// 云开发预约开关：true = 从云数据库读预约，false = 从本地存储读
const USE_CLOUD_RESERVATION = true

Page({
  data: {
    reservations: [],
    isEmpty: true
  },

  onLoad() {
    this.loadReservations()
  },

  onShow() {
    this.loadReservations()
  },

  loadReservations() {
    if (USE_CLOUD_RESERVATION) {
      this.loadCloudReservations()
      return
    }
    this.loadLocalReservations()
  },

  // 后端版：查当前家长孩子名下的所有预约（与网页管理端共用 reservations 表）
  loadCloudReservations() {
    const self = this
    app.loadChildrenFromCloud().then(children => {
      const studentIds = (children || []).map(c => String(c.id))
      if (!studentIds.length) {
        self.setData({ reservations: [], isEmpty: true })
        return
      }
      const openId = wx.getStorageSync('openId')
      wx.request({
        url: `${app.globalData.API_BASE_URL}/api/reservations`,
        method: 'GET',
        header: { 'content-type': 'application/json', 'X-WX-OPENID': openId },
        success: (res) => {
          if (res.statusCode === 200) {
            const all = res.data || []
            const myRes = all.filter(r => r.studentId != null && studentIds.indexOf(String(r.studentId)) !== -1)
            const reservations = myRes.map(r => ({
              courseId: r.courseId,
              courseName: r.courseName || '',
              childId: r.studentId,
              childName: r.childName || '',
              date: r.reservationDate || '',
              time: (r.reservationTime || '').substring(0, 5) || '',
              location: '',
              description: '',
              teacher: '',
              teacherPhone: '',
              capacity: 0,
              reservedAt: r.reservationDate || ''
            }))
            self.attachAttendance(reservations)
          } else {
            self.loadLocalReservations()
          }
        },
        fail: () => self.loadLocalReservations()
      })
    }).catch(() => {
      self.loadLocalReservations()
    })
  },

  // 后端版：按学生查考勤，按 courseId+studentId 映射考勤状态/备注
  attachAttendance(reservations) {
    const self = this
    const studentIds = reservations.map(r => String(r.childId)).filter(Boolean)
    if (!studentIds.length) {
      self.setData({ reservations: reservations, isEmpty: reservations.length === 0 })
      return
    }
    const openId = wx.getStorageSync('openId')
    const fetchOne = (sid) => new Promise((resolve) => {
      wx.request({
        url: `${app.globalData.API_BASE_URL}/api/attendance/student-id/${sid}`,
        method: 'GET',
        header: { 'content-type': 'application/json', 'X-WX-OPENID': openId },
        success: (res) => resolve((res.statusCode === 200 && res.data && res.data.data) ? res.data.data : []),
        fail: () => resolve([])
      })
    })
    Promise.all(studentIds.map(fetchOne)).then(lists => {
      const attMap = {}
      lists.forEach(list => (list || []).forEach(a => {
        attMap[a.courseId + '_' + a.studentId] = a
      }))
      const list2 = reservations.map(r => {
        const att = attMap[r.courseId + '_' + r.childId]
        return Object.assign({}, r, {
          attendanceStatus: att ? att.status : '',
          attendanceFeedback: att ? att.notes : ''
        })
      })
      self.setData({ reservations: list2, isEmpty: list2.length === 0 })
    }).catch(() => {
      self.setData({ reservations: reservations, isEmpty: reservations.length === 0 })
    })
  },

  // 本地版：从 storage 读
  loadLocalReservations() {
    let myReservations = app.getUserStorage('myReservations')
    if (!Array.isArray(myReservations)) {
      myReservations = []
      app.setUserStorage('myReservations', [])
    }
    // 规范化教师信息（兼容旧存储数据）
    const reservations = myReservations.map(r => {
      const standardTeacher = app.getStandardTeacher(r.courseName || r.name, r.teacher)
      return {
        ...r,
        teacher: standardTeacher.name,
        teacherPhone: standardTeacher.phone
      }
    })
    this.setData({
      reservations: reservations,
      isEmpty: reservations.length === 0
    })
  },

  // 取消预约
  onCancelReservation(e) {
    const courseId = e.currentTarget.dataset.courseId
    const childId = e.currentTarget.dataset.childId
    const courseName = e.currentTarget.dataset.name
    const childName = e.currentTarget.dataset.childName || ''

    wx.showModal({
      title: '取消预约',
      content: `确定要取消「${courseName}」的预约吗？`,
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          if (USE_CLOUD_RESERVATION) {
            // 后端取消：先按 studentId+courseId 找到 reservation id，再 DELETE
            wx.showLoading({ title: '取消中...' })
            const openId = wx.getStorageSync('openId')
            wx.request({
              url: `${app.globalData.API_BASE_URL}/api/reservations?courseId=${courseId}`,
              method: 'GET',
              header: { 'content-type': 'application/json', 'X-WX-OPENID': openId },
              success: (res) => {
                const list = (res.data || []).filter(r => r.studentId != null && String(r.studentId) === String(childId))
                if (list.length === 0) {
                  wx.hideLoading()
                  wx.showToast({ title: '未找到预约记录', icon: 'none' })
                  return
                }
                wx.request({
                  url: `${app.globalData.API_BASE_URL}/api/reservations/${list[0].id}`,
                  method: 'DELETE',
                  header: { 'content-type': 'application/json', 'X-WX-OPENID': openId },
                  success: () => {
                    wx.hideLoading()
                    // 同步删除本地记录（双写保持兼容）
                    let myReservations = app.getUserStorage('myReservations') || []
                    myReservations = myReservations.filter(r => !(
                      String(r.courseId) === String(courseId) && String(r.childId) === String(childId)
                    ))
                    app.setUserStorage('myReservations', myReservations)

                    app.recordActivityLog({
                      type: 'course',
                      title: '取消预约',
                      summary: `已为「${childName || '该儿童'}」取消「${courseName}」`,
                      icon: '❌',
                      color: '#999'
                    })

                    this.loadReservations()
                    wx.showToast({ title: '已取消预约', icon: 'none' })
                  },
                  fail: () => {
                    wx.hideLoading()
                    wx.showModal({ title: '取消失败', content: '网络错误，请重试', showCancel: false })
                  }
                })
              },
              fail: () => {
                wx.hideLoading()
                wx.showModal({ title: '取消失败', content: '网络错误，请重试', showCancel: false })
              }
            })
          } else {
            // 本地取消
            let myReservations = app.getUserStorage('myReservations') || []
            myReservations = myReservations.filter(r => !(
              String(r.courseId) === String(courseId) && String(r.childId) === String(childId)
            ))
            app.setUserStorage('myReservations', myReservations)

            app.recordActivityLog({
              type: 'course',
              title: '取消预约',
              summary: `已为「${childName || '该儿童'}」取消「${courseName}」`,
              icon: '❌',
              color: '#999'
            })

            this.loadReservations()
            wx.showToast({ title: '已取消预约', icon: 'none' })
          }
        }
      }
    })
  },

  // 拨打电话
  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    }
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})