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

  // 云端版：从云数据库查当前用户所有预约
  loadCloudReservations() {
    wx.cloud.callFunction({
      name: 'reservation',
      data: { action: 'myAll' }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        const cloudRes = res.result.data || []
        // 映射字段，兼容前端 wxml 模板
        const reservations = cloudRes.map(r => {
          const standardTeacher = app.getStandardTeacher(r.courseName, r.courseTeacher)
          return {
            courseId: r.courseId,
            courseName: r.courseName || '',
            childId: r.childId,
            childName: r.childName || '',
            childAge: r.childAge || '',
            childGender: r.childGender || '',
            childRelation: r.childRelation || '',
            date: r.courseDate || '',
            weekday: r.courseWeekday || '',
            time: r.courseTime || '',
            location: r.courseLocation || '',
            description: r.courseDescription || '',
            teacher: standardTeacher.name,
            teacherPhone: standardTeacher.phone,
            capacity: r.courseCapacity || 40,
            reservedAt: r.reservedAt || ''
          }
        })
        this.setData({
          reservations: reservations,
          isEmpty: reservations.length === 0
        })
      }
    }).catch(err => {
      console.error('[云开发] 查询我的预约失败，回退到本地', err)
      this.loadLocalReservations()
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
            // 云端取消
            wx.showLoading({ title: '取消中...' })
            wx.cloud.callFunction({
              name: 'reservation',
              data: { action: 'cancel', courseId: parseInt(courseId), childId: String(childId) }
            }).then(cloudRes => {
              wx.hideLoading()
              if (cloudRes.result && cloudRes.result.code === 0) {
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
              } else {
                wx.showModal({ title: '取消失败', content: (cloudRes.result && cloudRes.result.msg) || '请重试', showCancel: false })
              }
            }).catch(err => {
              wx.hideLoading()
              console.error('[云开发] 取消预约失败', err)
              wx.showModal({ title: '取消失败', content: '网络错误，请重试', showCancel: false })
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