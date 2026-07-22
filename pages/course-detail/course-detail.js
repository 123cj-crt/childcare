// course-detail.js
Page({
  data: {
    course: null,
    teacher: null, // 用于存储教师信息
    children: [], // 用于存储孩子列表
    availableChildren: [], // 用于存储可预约的孩子列表
    showChildPicker: false, // 控制孩子选择器弹窗的显示
    selectedChildIndex: -1, // 记录选中的孩子索引
    parentName: '', // 用于存储家长姓名
    currentReservations: 0, // 当前预约人数
    isFull: false // 课程是否已满
  },
  onLoad: function (options) {
    const courseId = options.id || '1'
    this.setData({
      courseId: courseId
    });
    // console.log('onLoad - Current courseId:', courseId); // Removed log
    this.loadCourse(courseId)
  },

  onShow: function () {
    // console.log('onShow - Start, current courseId:', this.data.courseId, 'children:', this.data.children); // Removed this log
    this.getChildrenList(); // 页面显示时获取孩子列表
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.nickName) {
      this.setData({
        parentName: userInfo.nickName
      });
    }
  },

  getChildrenList: function () {
    const token = wx.getStorageSync('token');

    if (!token) {
      console.error('Token not found in storage.');
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'http://localhost:8080/api/child/list',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token,
        'X-WX-OPENID': 'oNI9IvqVGH2tVpkxGboMLN_SiAA8' // This might need to be dynamic
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          // console.log('getChildrenList - API raw data:', res.data.data); // Removed log
          this.setData({
            children: res.data.data.map(child => ({
              id: child.id,
              name: child.childName,
              phoneNumber: child.phoneNumber // Ensure phoneNumber is included
            }))
          });
          // console.log('getChildrenList - Children updated in setData:', this.data.children); // Removed log
        } else {
          console.error('API /api/child/list returned error:', res.data);
          wx.showToast({
            title: res.data.msg || '获取孩子列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求孩子列表失败', err);
        wx.showToast({
          title: '网络错误，获取孩子列表失败',
          icon: 'none'
        });
      }
    });
  },

  loadCourse(id) {
    wx.request({
      url: `http://localhost:8080/api/courses/${id}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const course = res.data;
          this.setData({
            course: {
              id: course.id,
              name: course.name,
              date: course.startDate, // 假设后端返回 startDate
              endDate: course.endDate, // 假设后端返回 endDate
              time: course.schedule, // 假设后端返回 schedule
              location: course.location,
              intro: course.description,
              notice: course.teacherId, // 临时存储teacherId，稍后会被教师姓名替换
              contact: course.contact,
              capacity: course.capacity || 0 // 课程容量
            }
          });
          
          // 如果有teacherId，则获取教师信息
          if (course.teacherId) {
            this.loadTeacherInfo(course.teacherId);
          }
          
          // 加载课程后，获取当前预约人数
          this.loadCurrentReservations(id);
        } else {
          console.error('获取课程详情失败', res);
        }
      },
      fail: (err) => {
        console.error('请求课程详情失败', err);
      }
    });
  },

  // 新增函数：根据teacherId获取教师信息
  loadTeacherInfo(teacherId) {
    wx.request({
      url: `http://localhost:8080/api/teachers/${teacherId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const teacher = res.data;
          this.setData({
            teacher: teacher
          });
          
          // 更新课程信息中的教师姓名为实际姓名
          const course = this.data.course;
          course.notice = teacher.name; // 将teacherId替换为教师姓名
          this.setData({
            course: course
          });
        } else {
          console.error('获取教师信息失败', res);
          // 如果获取教师信息失败，保持显示teacherId
        }
      },
      fail: (err) => {
        console.error('请求教师信息失败', err);
        // 如果请求失败，保持显示teacherId
      }
    });
  },

  // 获取当前预约人数
  loadCurrentReservations(courseId) {
    const token = wx.getStorageSync('token');
    if (!token) {
      return;
    }

    wx.request({
      url: `http://localhost:8080/api/reservations?courseId=${courseId}`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token,
        'X-WX-OPENID': 'oNI9IvqVGH2tVpkxGboMLN_SiAA8'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const reservations = res.data || [];
          const currentReservations = reservations.length;
          const capacity = this.data.course.capacity || 0;
          const isFull = currentReservations >= capacity;
          
          this.setData({
            currentReservations: currentReservations,
            isFull: isFull
          });
        }
      },
      fail: (err) => {
        console.error('获取预约人数失败', err);
      }
    });
  },

  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.course.contact
    })
  },

  onReserveTap: function () {
    const { courseId, children, isFull, currentReservations, course } = this.data;
    const token = wx.getStorageSync('token');

    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 检查课程是否已满
    if (isFull) {
      wx.showToast({
        title: '课程人数已满，无法预约',
        icon: 'none',
        duration: 3000
      });
      return;
    }

    // 刷新预约人数
    this.loadCurrentReservations(courseId);

    wx.request({
      url: `http://localhost:8080/api/reservations?courseId=${courseId}`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token,
        'X-WX-OPENID': 'oNI9IvqVGH2tVpkxGboMLN_SiAA8' // This might need to be dynamic
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const reservedStudentIds = res.data.map(reservation => reservation.studentId);
          const availableChildren = children.filter(child => !reservedStudentIds.includes(child.id));

          if (availableChildren.length === 0) {
            wx.showToast({
              title: '所有孩子都已预约此课程',
              icon: 'none'
            });
            return;
          }

          this.setData({
            showChildPicker: true,
            availableChildren: availableChildren // Store filtered children in a new data property
          });
        } else {
          console.error('获取课程预约列表失败', res);
          wx.showToast({
            title: '获取预约信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求课程预约列表失败', err);
        wx.showToast({
          title: '网络错误，获取预约信息失败',
          icon: 'none'
        });
      }
    });
  },

  onChildSelect: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedChildIndex: index
    });
  },

  onCancelChildPicker: function () {
    this.setData({
      showChildPicker: false,
      selectedChildIndex: -1 // Reset selected child
    });
  },

  confirmReservation: function () {
    const { courseId, availableChildren, selectedChildIndex, parentName } = this.data;
    if (selectedChildIndex === -1) {
      wx.showToast({
        title: '请选择一个孩子',
        icon: 'none'
      });
      return;
    }
    const studentId = availableChildren[selectedChildIndex].id; // 获取选中的孩子ID
    const studentName = availableChildren[selectedChildIndex].name; // 获取选中的孩子姓名
    const studentPhoneNumber = availableChildren[selectedChildIndex].phoneNumber; // 获取选中的孩子电话
    const courseName = this.data.course.name;
    const reservationDate = new Date().toISOString().split('T')[0]; // Current date as reservation date
    const reservationTime = new Date().toTimeString().split(' ')[0]; // Current time as reservation time

    wx.request({
      url: 'http://localhost:8080/api/reservations',
      method: 'POST',
      data: {
        courseId: courseId,
        courseName: courseName,
        studentId: studentId,
        reservationDate: reservationDate,
        reservationTime: reservationTime,
        status: 'pending' // Default status
      },
      success: (res) => {
        if (res.statusCode === 201) {
          wx.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 2000
          });
          // 获取全局 App 实例
          const app = getApp();
          // 存储通知
          app.addNotification(this.data.course.name); // Use course.name instead of course.courseName
          console.log('Notification added for:', this.data.course.name);
          // 2秒后关闭弹窗
          setTimeout(() => {
            this.setData({
              showChildPicker: false,
              selectedChildIndex: -1 // Reset selected child after successful reservation
            });
            // 记录预约详情
            // console.log('confirmReservation - Reservation details:', studentId, courseId); // Removed log
            this.getChildrenList(); // Refresh children list after reservation
            this.loadCurrentReservations(courseId); // 刷新预约人数
            // console.log('confirmReservation - Children list after refreshing:', this.data.children); // Removed log
          }, 2000); // Close the popup after the toast disappears

          // Log the reservation details as a table
          console.log('--- 预约详情 ---');
          console.log('孩子姓名:', studentName);
          console.log('课程名称:', courseName);
          console.log('家长姓名:', parentName || '未知');
          console.log('家长电话:', studentPhoneNumber || '未知'); // Using child's phone as parent's for now
          console.log('----------------');

        } else {
          wx.showToast({
            title: '预约失败，请稍后再试',
            icon: 'none'
          });
          console.error('Reservation failed:', res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请稍后再试',
          icon: 'none'
        });
        console.error('Reservation request error:', err);
      }
    });
  },
})
