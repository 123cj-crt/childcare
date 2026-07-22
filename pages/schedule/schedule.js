Page({
  data: {
    schedules: [],
    startDate: '', // Initialize with current date or empty
    endDate: '',   // Initialize with current date or empty
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
    this.loadSchedules(); // 在onShow中调用，确保每次页面显示时都加载最新数据
  },

  bindStartDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    }, () => {
      this.loadSchedules(); // Reload schedules when start date changes
    });
  },

  bindEndDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    }, () => {
      this.loadSchedules(); // Reload schedules when end date changes
    });
  },

  loadSchedules: function () {
    const { startDate, endDate } = this.data;
    let reservationsUrl = 'http://localhost:8080/api/reservations';
    let coursesUrl = 'http://localhost:8080/api/courses'; // Assuming this endpoint exists

    const reservationParams = [];
    if (startDate) {
      reservationParams.push(`startDate=${startDate}`);
    }
    if (endDate) {
      reservationParams.push(`endDate=${endDate}`);
    }
    if (reservationParams.length > 0) {
      reservationsUrl += `?${reservationParams.join('&')}`;
    }

    console.log('Requesting reservations from URL:', reservationsUrl);

    console.log('Initiating courses request to URL:', coursesUrl);
    // Step 1: Fetch all courses
    wx.request({
      url: coursesUrl,
      method: 'GET',
      success: (courseRes) => {
        if (courseRes.statusCode === 200) {
          const courses = courseRes.data;
          const courseMap = {};
          courses.forEach(course => {
            courseMap[course.id] = course;
          });
          console.log('Fetched courses:', courseMap);

          // Step 2: Fetch reservations
          console.log('Initiating reservations request to URL:', reservationsUrl); // Add this line
          wx.request({
            url: reservationsUrl,
            method: 'GET',
            success: (res) => {
              console.log('API Response (reservations):', res.data);
              if (res.statusCode === 200) {
                const reservations = res.data;
                const schedules = reservations.map(reservation => {
                  const course = courseMap[reservation.courseId]; // Assuming reservation has courseId
                  return {
                    id: reservation.id,
                    name: `${course ? course.name : '未知课程'} - ${reservation.childName}`,
                    courseStartDate: course ? String(course.startDate) : 'N/A',
                    courseEndDate: course ? String(course.endDate) : 'N/A',
                    courseSchedule: course ? course.schedule : 'N/A',
                    icon: '/icon/book.png' // 默认图标
                  };
                });
                this.setData({ schedules: schedules });
              } else {
                console.error('获取预约列表失败', res);
              }
            },
            fail: (err) => {
              console.error('请求预约列表失败', err);
              // 使用示例数据
              this.setData({
                schedules: this.getSampleSchedules()
              });
            }
          });

        } else {
          console.error('获取课程列表失败', courseRes);
        }
      },
      fail: (err) => {
        console.error('请求课程列表失败', err);
        // 使用示例数据
        this.setData({
          schedules: this.getSampleSchedules()
        });
      }
    });
  },

  // 获取示例课程安排数据
  getSampleSchedules() {
    return [
      {
        id: 1,
        name: '创意美术课 - 小明',
        courseStartDate: '2024-01-15',
        courseEndDate: '2024-03-15',
        courseSchedule: '周一 09:00-10:30',
        icon: '/icon/book.png'
      },
      {
        id: 2,
        name: '音乐启蒙课 - 小红',
        courseStartDate: '2024-01-16',
        courseEndDate: '2024-03-16',
        courseSchedule: '周二 14:00-15:30',
        icon: '/icon/book.png'
      },
      {
        id: 3,
        name: '科学探索课 - 小刚',
        courseStartDate: '2024-01-17',
        courseEndDate: '2024-03-17',
        courseSchedule: '周三 10:00-11:30',
        icon: '/icon/book.png'
      },
      {
        id: 4,
        name: '运动体能课 - 小丽',
        courseStartDate: '2024-01-18',
        courseEndDate: '2024-03-18',
        courseSchedule: '周四 15:00-16:30',
        icon: '/icon/book.png'
      }
    ];
  }
})
