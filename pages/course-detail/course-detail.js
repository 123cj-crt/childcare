const { request } = require('../../utils/request');

const PARENT_OPEN_ID = 'oNI9IvqVGH2tVpkxGboMLN_SiAA8';

function getAuthorizedHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
    'X-WX-OPENID': PARENT_OPEN_ID
  };
}

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

  onLoad(options) {
    const courseId = options.id || '1';
    this.setData({ courseId });
    this.loadCourse(courseId);
  },

  onShow() {
    this.getChildrenList();
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.nickName) {
      this.setData({ parentName: userInfo.nickName });
    }
  },

  getChildrenList() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    request({ path: '/api/child/list', header: getAuthorizedHeader(token) })
      .then((response) => {
        if (!response.data || response.data.code !== 200) {
          throw { type: 'business', path: '/api/child/list', data: response.data };
        }

        this.setData({
          children: (response.data.data || []).map((child) => ({
            id: child.id,
            name: child.childName,
            phoneNumber: child.phoneNumber
          }))
        });
      })
      .catch((error) => {
        console.error('[课程详情] 获取孩子列表失败。', error);
        wx.showToast({ title: '获取孩子列表失败', icon: 'none' });
      });
  },

  loadCourse(id) {
    request({ path: `/api/courses/${id}` })
      .then((response) => {
        const course = response.data;
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
      })
      .catch((error) => {
        console.error('[课程详情] 获取课程详情失败。', error);
        wx.showToast({ title: '课程详情暂不可用', icon: 'none' });
      });
  },

  loadTeacherInfo(teacherId) {
    request({ path: `/api/teachers/${teacherId}` })
      .then((response) => {
        const teacher = response.data;
        const course = this.data.course;
        this.setData({
          teacher,
          course: course ? { ...course, notice: teacher.name } : course
        });
      })
      .catch((error) => console.error('[课程详情] 获取教师信息失败。', error));
  },

  loadCurrentReservations(courseId) {
    const token = wx.getStorageSync('token');
    if (!token) {
      return;
    }

    request({
      path: '/api/reservations',
      data: { courseId },
      header: getAuthorizedHeader(token)
    })
      .then((response) => {
        const reservations = Array.isArray(response.data) ? response.data : [];
        const capacity = this.data.course ? this.data.course.capacity : 0;
        this.setData({
          currentReservations: reservations.length,
          isFull: reservations.length >= capacity
        });
      })
      .catch((error) => console.error('[课程详情] 获取预约人数失败。', error));
  },

  makePhoneCall() {
    if (this.data.course && this.data.course.contact) {
      wx.makePhoneCall({ phoneNumber: this.data.course.contact });
    }
  },

  onReserveTap() {
    const { courseId, children, isFull } = this.data;
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (isFull) {
      wx.showToast({ title: '课程人数已满，无法预约', icon: 'none', duration: 3000 });
      return;
    }

    request({
      path: '/api/reservations',
      data: { courseId },
      header: getAuthorizedHeader(token)
    })
      .then((response) => {
        const reservations = Array.isArray(response.data) ? response.data : [];
        const reservedStudentIds = reservations.map((reservation) => reservation.studentId);
        const availableChildren = children.filter((child) => !reservedStudentIds.includes(child.id));
        if (availableChildren.length === 0) {
          wx.showToast({ title: '所有孩子都已预约此课程', icon: 'none' });
          return;
        }
        this.setData({ showChildPicker: true, availableChildren });
      })
      .catch((error) => {
        console.error('[课程详情] 获取课程预约列表失败。', error);
        wx.showToast({ title: '获取预约信息失败', icon: 'none' });
      });
  },

  onChildSelect(e) {
    this.setData({ selectedChildIndex: e.currentTarget.dataset.index });
  },

  onCancelChildPicker() {
    this.setData({ showChildPicker: false, selectedChildIndex: -1 });
  },

  confirmReservation() {
    const { courseId, availableChildren, selectedChildIndex, course } = this.data;
    if (selectedChildIndex === -1 || !course) {
      wx.showToast({ title: '请选择一个孩子', icon: 'none' });
      return;
    }

    const child = availableChildren[selectedChildIndex];
    request({
      path: '/api/reservations',
      method: 'POST',
      data: {
        courseId,
        courseName: course.name,
        studentId: child.id,
        reservationDate: new Date().toISOString().split('T')[0],
        reservationTime: new Date().toTimeString().split(' ')[0],
        status: 'pending'
      }
    })
      .then((response) => {
        if (response.statusCode !== 201) {
          throw { type: 'business', path: '/api/reservations', data: response.data };
        }

        getApp().addNotification(course.name);
        wx.showToast({ title: '预约成功', icon: 'success', duration: 2000 });
        this.setData({ showChildPicker: false, selectedChildIndex: -1 });
        this.getChildrenList();
        this.loadCurrentReservations(courseId);
      })
      .catch((error) => {
        console.error('[课程详情] 创建预约失败。', error);
        wx.showToast({ title: '预约失败，请稍后再试', icon: 'none' });
      });
  }
});
