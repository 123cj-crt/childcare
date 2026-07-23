const { request } = require('../../utils/request');

Page({
  data: {
    schedules: [],
    startDate: '',
    endDate: '',
    hasShownFallbackNotice: false
  },

  onLoad() {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.setData({ startDate: formattedDate, endDate: formattedDate });
  },

  onShow() {
    this.loadSchedules();
  },

  bindStartDateChange(e) {
    this.setData({ startDate: e.detail.value }, () => this.loadSchedules());
  },

  bindEndDateChange(e) {
    this.setData({ endDate: e.detail.value }, () => this.loadSchedules());
  },

  loadSchedules() {
    request({ path: '/api/courses' })
      .then((courseResponse) => {
        const courses = Array.isArray(courseResponse.data) ? courseResponse.data : [];
        const courseMap = courses.reduce((result, course) => {
          result[course.id] = course;
          return result;
        }, {});

        return request({
          path: '/api/reservations',
          data: {
            startDate: this.data.startDate,
            endDate: this.data.endDate
          }
        }).then((reservationResponse) => ({ courseMap, reservations: reservationResponse.data }));
      })
      .then(({ courseMap, reservations }) => {
        const schedules = (Array.isArray(reservations) ? reservations : []).map((reservation) => {
          const course = courseMap[reservation.courseId];
          return {
            id: reservation.id,
            name: `${course ? course.name : '未知课程'} - ${reservation.childName || '未登记儿童'}`,
            courseStartDate: course ? String(course.startDate) : 'N/A',
            courseEndDate: course ? String(course.endDate) : 'N/A',
            courseSchedule: course ? course.schedule : 'N/A',
            icon: '/icon/book.png'
          };
        });
        this.setData({ schedules });
      })
      .catch((error) => {
        console.warn('[课表] 课程或预约接口不可用，已显示示例数据。', error);
        this.setData({ schedules: this.getSampleSchedules() });
        this.showFallbackNotice();
      });
  },

  showFallbackNotice() {
    if (this.data.hasShownFallbackNotice) {
      return;
    }

    this.setData({ hasShownFallbackNotice: true });
    wx.showToast({ title: '后端不可用，已显示示例数据', icon: 'none' });
  },

  getSampleSchedules() {
    return [
      { id: 1, name: '创意美术课 - 小明', courseStartDate: '2024-01-15', courseEndDate: '2024-03-15', courseSchedule: '周一 09:00-10:30', icon: '/icon/book.png' },
      { id: 2, name: '音乐启蒙课 - 小红', courseStartDate: '2024-01-16', courseEndDate: '2024-03-16', courseSchedule: '周二 14:00-15:30', icon: '/icon/book.png' },
      { id: 3, name: '科学探索课 - 小刚', courseStartDate: '2024-01-17', courseEndDate: '2024-03-17', courseSchedule: '周三 10:00-11:30', icon: '/icon/book.png' },
      { id: 4, name: '运动体能课 - 小丽', courseStartDate: '2024-01-18', courseEndDate: '2024-03-18', courseSchedule: '周四 15:00-16:30', icon: '/icon/book.png' }
    ];
  }
});
