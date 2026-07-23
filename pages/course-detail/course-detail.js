// pages/course-detail/course-detail.js
const app = getApp()

Page({
  data: {
    course: null,
    teacher: null,
    children: [],
    availableChildren: [],
    showChildPicker: false,
    selectedChildIndex: -1,
    parentName: '',
    currentReservations: 0,
    isFull: false
  },

  onLoad: function (options) {
    const courseId = options.id || '1'
    this.setData({ courseId: courseId });
    this.loadCourse(courseId)
  },

  onShow: function () {
    this.getChildrenList();
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.nickName) {
      this.setData({ parentName: userInfo.nickName });
    }
  },

  getChildrenList: function () {
    const token = wx.getStorageSync('token');
    const openId = wx.getStorageSync('openId');

    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/child/list`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        // child/list 返回 R<> 格式
        if (res.statusCode === 200 && res.data.code === 200) {
          this.setData({
            children: res.data.data.map(child => ({
              id: child.id,
              name: child.childName,
              phoneNumber: child.phoneNumber
            }))
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取孩子列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求孩子列表失败', err);
        wx.showToast({ title: '网络错误，获取孩子列表失败', icon: 'none' });
      }
    });
  },

  loadCourse(id) {
    // courses 返回裸数据，无 R 包装
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/courses/${id}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const course = res.data;
          this.setData({
            course: {
              id: course.id,
              name: course.name,
              date: course.startDate,
              endDate: course.endDate,
              time: course.schedule,
              location: course.location,
              intro: course.description,
              notice: course.teacherId,
              contact: course.contact,
              capacity: course.capacity || 0
            }
          });

          if (course.teacherId) {
            this.loadTeacherInfo(course.teacherId);
          }
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

  loadTeacherInfo(teacherId) {
    // teachers 返回裸数据，无 R 包装
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/teachers/${teacherId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const teacher = res.data;
          this.setData({ teacher: teacher });

          // 更新课程中的教师姓名
          const course = this.data.course;
          if (course) {
            course.notice = teacher.name;
            this.setData({ course: course });
          }
        } else {
          console.error('获取教师信息失败', res);
        }
      },
      fail: (err) => {
        console.error('请求教师信息失败', err);
      }
    });
  },

  loadCurrentReservations(courseId) {
    const token = wx.getStorageSync('token');
    if (!token) return;

    const openId = wx.getStorageSync('openId');

    // reservations 返回裸数组，无 R 包装
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/reservations?courseId=${courseId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const reservations = res.data || [];
          const currentReservations = reservations.length;
          const capacity = this.data.course ? this.data.course.capacity : 0;
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
    const { courseId, children, isFull } = this.data;
    const token = wx.getStorageSync('token');
    const openId = wx.getStorageSync('openId');

    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (isFull) {
      wx.showToast({ title: '课程人数已满，无法预约', icon: 'none', duration: 3000 });
      return;
    }

    // 查询已预约列表，过滤出可预约的孩子
    // reservations 返回裸数组，无 R 包装
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/reservations?courseId=${courseId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const reservedStudentIds = (res.data || []).map(r => r.studentId);
          const availableChildren = children.filter(child => !reservedStudentIds.includes(child.id));

          if (availableChildren.length === 0) {
            wx.showToast({ title: '所有孩子都已预约此课程', icon: 'none' });
            return;
          }

          this.setData({
            showChildPicker: true,
            availableChildren: availableChildren
          });
        } else {
          wx.showToast({ title: '获取预约信息失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('请求课程预约列表失败', err);
        wx.showToast({ title: '网络错误，获取预约信息失败', icon: 'none' });
      }
    });
  },

  onChildSelect: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedChildIndex: index });
  },

  onCancelChildPicker: function () {
    this.setData({ showChildPicker: false, selectedChildIndex: -1 });
  },

  confirmReservation: function () {
    const { courseId, availableChildren, selectedChildIndex, parentName, course } = this.data;

    if (selectedChildIndex === -1) {
      wx.showToast({ title: '请选择一个孩子', icon: 'none' });
      return;
    }

    const selectedChild = availableChildren[selectedChildIndex];
    const studentId = selectedChild.id;
    const studentName = selectedChild.name;
    const courseName = course.name;
    const reservationDate = new Date().toISOString().split('T')[0];
    const reservationTime = new Date().toTimeString().split(' ')[0];

    // reservations POST 返回裸对象 (HTTP 201)，无 R 包装
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/reservations`,
      method: 'POST',
      data: {
        courseId: parseInt(courseId),
        courseName: courseName,
        studentId: studentId,
        childName: studentName,       // API 文档要求此字段
        reservationDate: reservationDate,
        reservationTime: reservationTime,
        status: 'pending',
        notes: ''
      },
      success: (res) => {
        if (res.statusCode === 201) {
          wx.showToast({ title: '预约成功', icon: 'success', duration: 2000 });

          // 存储通知
          app.addNotification(courseName);

          setTimeout(() => {
            this.setData({ showChildPicker: false, selectedChildIndex: -1 });
            this.getChildrenList();
            this.loadCurrentReservations(courseId);
          }, 2000);

          console.log('--- 预约详情 ---');
          console.log('孩子姓名:', studentName);
          console.log('课程名称:', courseName);
          console.log('家长姓名:', parentName || '未知');
          console.log('----------------');
        } else {
          wx.showToast({ title: '预约失败，请稍后再试', icon: 'none' });
          console.error('Reservation failed:', res);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误，请稍后再试', icon: 'none' });
        console.error('Reservation request error:', err);
      }
    });
  },
})
