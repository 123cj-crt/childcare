// pages/history-courses/history-courses.js
const app = getApp()

// ========== 调试模式 ==========
// true: 没有历史课程时显示所有未取消的预约作为演示（带"演示"标记）
// false: 严格按"课程结束时间 < 当前时间"过滤
const DEBUG_SHOW_ALL = false

Page({
  data: {
    historyList: [],
    isEmpty: true,
    isDemo: false  // 是否演示模式
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.loadHistory()
  },

  // 把"8月10日" + "09:00-11:00" 转成课程结束时间戳
  parseCourseEndTime(dateStr, timeStr) {
    const year = new Date().getFullYear()
    let month = 0, day = 0
    if (dateStr) {
      const m = String(dateStr).match(/(\d{1,2})月(\d{1,2})日/)
      if (m) {
        month = parseInt(m[1])
        day = parseInt(m[2])
      }
    }
    let hour = 23, minute = 59
    if (timeStr) {
      // 兼容 "09:00-11:00" / "09:00 ~ 11:00" / "11:00"
      const parts = String(timeStr).split(/[-~]/)
      const endPart = parts[parts.length - 1].trim()
      const tm = endPart.match(/(\d{1,2}):(\d{1,2})/)
      if (tm) {
        hour = parseInt(tm[1])
        minute = parseInt(tm[2])
      }
    }
    return new Date(year, month - 1, day, hour, minute, 0).getTime()
  },

  loadHistory() {
    let myReservations = app.getUserStorage('myReservations')
    if (!Array.isArray(myReservations)) {
      myReservations = []
    }

    const now = Date.now()

    // 真实历史：课程结束时间 < 当前时间
    const realHistory = myReservations.filter(r => {
      const endTs = this.parseCourseEndTime(r.date, r.time)
      return endTs > 0 && now > endTs
    })

    let historyList = realHistory
    let isDemo = false

    // DEBUG 模式：没有真实历史时，把所有未取消预约当演示
    if (DEBUG_SHOW_ALL && realHistory.length === 0 && myReservations.length > 0) {
      historyList = myReservations
      isDemo = true
    }

    // 按课程结束时间倒序（最近的在前）
    historyList = historyList.slice().sort((a, b) => {
      const ta = this.parseCourseEndTime(a.date, a.time)
      const tb = this.parseCourseEndTime(b.date, b.time)
      return tb - ta
    })

    this.setData({
      historyList: historyList,
      isEmpty: historyList.length === 0,
      isDemo: isDemo
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
