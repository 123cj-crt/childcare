// pages/schedule/schedule.js
const app = getApp()

Page({
  data: {
    schedules: [],
    startDate: '',
    endDate: ''
  },

  onLoad: function () {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    this.setData({
      startDate: formattedDate,
      endDate: formattedDate
    });
  },

  onShow: function () {
    this.loadSchedules();
  },

  bindStartDateChange: function (e) {
    this.setData({ startDate: e.detail.value }, () => {
      this.loadSchedules();
    });
  },

  bindEndDateChange: function (e) {
    this.setData({ endDate: e.detail.value }, () => {
      this.loadSchedules();
    });
  },

  loadSchedules: function () {
    const { startDate, endDate } = this.data;
    const openId = wx.getStorageSync('openId');

    // courses 返回裸数组，reservations 返回裸数组，均无 R 包装
    let reservationsUrl = `${app.globalData.API_BASE_URL}/api/reservations`;
    const coursesUrl = `${app.globalData.API_BASE_URL}/api/courses`;

    // 日期筛选参数（注意：后端可能还不支持，需要小样配合加）
    const reservationParams = [];
    if (startDate) reservationParams.push(`startDate=${startDate}`);
    if (endDate) reservationParams.push(`endDate=${endDate}`);
    if (reservationParams.length > 0) {
      reservationsUrl += `?${reservationParams.join('&')}`;
    }

    // Step 1: 获取所有课程
    wx.request({
      url: coursesUrl,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (courseRes) => {
        if (courseRes.statusCode === 200) {
          const courses = courseRes.data || [];
          const courseMap = {};
          courses.forEach(course => {
            courseMap[course.id] = course;
          });

          // Step 2: 获取预约列表
          wx.request({
            url: reservationsUrl,
            method: 'GET',
            header: {
              'content-type': 'application/json',
              'X-WX-OPENID': openId
            },
            success: (res) => {
              if (res.statusCode === 200) {
                const reservations = res.data || [];
                const schedules = reservations.map(reservation => {
                  const course = courseMap[reservation.courseId];
                  return {
                    id: reservation.id,
                    name: `${course ? course.name : '未知课程'} - ${reservation.childName || ''}`,
                    courseStartDate: course ? String(course.startDate) : 'N/A',
                    courseEndDate: course ? String(course.endDate) : 'N/A',
                    courseSchedule: course ? course.schedule : 'N/A',
                    icon: '/icon/book.png'
                  };
                });
                this.setData({ schedules: schedules });
              } else {
                console.error('获取预约列表失败', res);
                this.setData({ schedules: [] });
              }
            },
            fail: (err) => {
              console.error('请求预约列表失败', err);
              this.setData({ schedules: [] });
            }
          });

        } else {
          console.error('获取课程列表失败', courseRes);
          this.setData({ schedules: [] });
        }
      },
      fail: (err) => {
        console.error('请求课程列表失败', err);
        this.setData({ schedules: [] });
      }
    });
  }
})
