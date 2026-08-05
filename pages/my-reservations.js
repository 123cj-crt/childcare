// pages/my-reservations/my-reservations.js
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
    const myReservations = wx.getStorageSync('myReservations') || []
    this.setData({
      reservations: myReservations,
      isEmpty: myReservations.length === 0
    })
  },

  // 取消预约
  onCancelReservation(e) {
    const courseId = e.currentTarget.dataset.id
    const courseName = e.currentTarget.dataset.name

    wx.showModal({
      title: '取消预约',
      content: `确定要取消「${courseName}」的预约吗？`,
      confirmColor: '#e64340',
      success: (res) => {
        if (res.confirm) {
          let myReservations = wx.getStorageSync('myReservations') || []
          myReservations = myReservations.filter(r => String(r.courseId) !== String(courseId))
          wx.setStorageSync('myReservations', myReservations)
          this.loadReservations()
          wx.showToast({ title: '已取消预约', icon: 'none' })
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