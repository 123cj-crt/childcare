// pages/course-detail/course-detail.js
const app = getApp()

// ========== 调试模式 ==========
const DEBUG_MOCK_DATA = false

// 云开发预约开关：true = 预约数据走云数据库（跨用户实时同步），false = 走本地存储
const USE_CLOUD_RESERVATION = true

const MOCK_COURSES = [
  {
    id: 1,
    name: '税启新知——税收课堂开班典礼',
    date: '8月10日',
    weekday: '周一',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '为响应国家"税收普法从青少年抓起"的号召，依托专业所学为青少年打造趣味税收小课堂。活动以生活化科普代替条文讲解，引导小朋友发现生活里的税收，首场授课既是公益教学的落地开端，也为分阶段科普基础税种知识做好铺垫。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 15,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 2,
    name: '个人所得税小课堂：爸爸妈妈的工资去哪了',
    date: '8月10日',
    weekday: '周一',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '个人所得税是与每个家庭最直接相关的税种。本课程通过工资条、家庭生活等孩子熟悉的场景，将抽象的税收概念转化为生活常识，帮助孩子理解"公民义务"，体会税收与日常生活的紧密联系。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 18,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 3,
    name: '资源税——地球的"守护税"',
    date: '8月11日',
    weekday: '周二',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '我们每天用的电、水、汽油，甚至铅笔、书本，都来自地球上的自然资源。国家通过征收"资源税"，让开采资源的人多付一些钱，用来保护环境、寻找新能源。小朋友了解资源税，就能更懂为什么要节约用水、随手关灯。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 12,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 4,
    name: '粘土筑童趣——创意粘土DIY课堂',
    date: '8月11日',
    weekday: '周二',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '为丰富托管服务形式、劳逸结合、缓解孩子们课堂学习疲劳，在系列财税科普课堂之余开设趣味手工拓展课程，依托超轻粘土开展美育实践活动。孩子们可以在动手创作中锻炼动手能力、想象力与专注力。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 20,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 5,
    name: '小小税收家——生活中隐形的小税费',
    date: '8月12日',
    weekday: '周三',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '在日常衣食住行、买房购车中，多种税费默默影响城市建设与公共配套。车辆购置税、契税、房产税、城建税及教育费附加和买车、买房、城市基建息息相关。本次课程拆解四种税费的由来、用途与征收，让孩子看懂花钱买房买车时的隐形税收。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 14,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 6,
    name: '听见旋律里的心情——音乐情感表达探秘趣味课',
    date: '8月12日',
    weekday: '周三',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '以趣味互动、游戏闯关、创意实践为核心，带领学生聆听不同风格的音乐，探索音乐与情绪之间的关联，在轻松欢乐的氛围中提升音乐感知力与审美素养。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 22,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 7,
    name: '税收与公共服务——钱去哪儿了？',
    date: '8月13日',
    weekday: '周四',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '孩子们已经知道买东西要交税，但交上去的税到底去了哪里？本课从孩子最熟悉的公共设施入手，带领他们发现税收如何变成身边的公共服务，理解"取之于民，用之于民"。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 16,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 8,
    name: '发票大揭秘 生活寻税行',
    date: '8月13日',
    weekday: '周四',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '以生活化认知为核心，以孩子看得见、摸得着的消费场景和发票实例为切入点，结合真实生活案例讲解税收的来源与用途，让学生在真实、趣味、直观的课堂体验中读懂税收、理解税收。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 13,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 9,
    name: '税收嘉年华・闯关大冒险',
    date: '8月14日',
    weekday: '周五',
    time: '09:00-11:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '孩子们已系统学习税收基础概念及核心税种知识，通过沉浸式趣味实践巩固学习成果。本次游园会以闯关集章形式，保留经典互动项目并创新内容设计，让孩子们在游戏中深化对税收知识的理解。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 25,
    teacher: '小明',
    teacherPhone: '666666'
  },
  {
    id: 10,
    name: '童心绘税 知行同行',
    date: '8月14日',
    weekday: '周五',
    time: '15:00-17:00',
    location: '广东省江门市鹤山市沙坪街道新升社区',
    description: '为帮助大家系统回顾课堂知识、加深学习印象，进一步把所学内容和生活实物对应结合，特开展本次总结提升课。课程延续趣味互动形式，以绘画、小游戏为主，在轻松的氛围中梳理知识点，巩固学习成果。',
    targetAge: '6-12岁儿童',
    capacity: 40,
    currentStudents: 19,
    teacher: '小明',
    teacherPhone: '666666'
  }
]
// =================================

Page({
  data: {
    courseId: null,
    course: null,
    teacher: null,
    isReserved: false,
    reservedCount: 0,
    currentReservations: 0,
    isFull: false,
    capacityPercent: 0,
    children: [],
    showChildPicker: false,
    pickerChildren: []
  },

  onLoad: function (options) {
    const courseId = options.id || '1'
    this.setData({ courseId: courseId })
    this.loadCourse(courseId)
    this.loadChildren()
    this.checkReservationStatus(courseId)
  },

  onShow: function () {
    this.loadChildren()
  },

  // 加载已绑定的儿童列表
  loadChildren() {
    let myChildren = app.getUserStorage('myChildren') || []
    // 兼容旧数据：如果缓存中的儿童没有 id，用 index 生成兜底 id
    myChildren = myChildren.map((child, index) => ({
      ...child,
      id: child.id !== undefined && child.id !== null && child.id !== ''
        ? child.id
        : ('child_' + index)
    }))
    this.setData({ children: myChildren })
  },

  loadCourse(id) {
    if (DEBUG_MOCK_DATA) {
      const course = MOCK_COURSES.find(c => c.id === parseInt(id))
      if (course) {
        // 优先使用缓存的真实人数，避免先显示 mock 默认值再跳变
        const cachedCounts = wx.getStorageSync('cloud_course_counts') || {}
        const initialCount = cachedCounts[course.id] !== undefined ? cachedCounts[course.id] : course.currentStudents
        this.setData({
          course: course,
          teacher: {
            name: course.teacher,
            phone: course.teacherPhone
          },
          currentReservations: initialCount,
          isFull: initialCount >= course.capacity,
          capacityPercent: Math.round(initialCount / course.capacity * 100)
        })
        // 云开发模式：用真实预约人数覆盖 mock 的 currentStudents
        if (USE_CLOUD_RESERVATION) {
          this.loadCloudReservationCount(course.id)
        }
      }
      return
    }

    // 正式版：从服务器加载
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/courses/${id}`,
      method: 'GET',
      timeout: 10000,
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId || ''
      },
      success: (res) => {
        console.log('[course-detail] 响应:', res.statusCode, res.data)
        if (res.statusCode === 200) {
          const backendCourse = res.data
          const course = this.normalizeCourse(backendCourse)
          this.setData({ course })
          this.loadTeacherInfo(course.teacherId)
          if (USE_CLOUD_RESERVATION) {
            this.loadCloudReservationCount(course.id)
          } else {
            this.loadCurrentReservations(id)
          }
        }
      },
      fail: (err) => {
        console.error('[course-detail] 请求失败:', err)
        // 兜底：用 mock 数据
        const course = MOCK_COURSES.find(c => c.id === parseInt(id))
        if (course) {
          const cachedCounts = wx.getStorageSync('cloud_course_counts') || {}
          const initialCount = cachedCounts[course.id] !== undefined ? cachedCounts[course.id] : course.currentStudents
          this.setData({
            course: course,
            teacher: { name: course.teacher, phone: course.teacherPhone },
            currentReservations: initialCount,
            isFull: initialCount >= course.capacity,
            capacityPercent: Math.round(initialCount / course.capacity * 100)
          })
          if (USE_CLOUD_RESERVATION) {
            this.loadCloudReservationCount(course.id)
          }
        }
      }
    })
  },

  // 后端课程字段 → 前端 wxml 字段统一转换
  normalizeCourse(c) {
    const startDate = c.startDate || ''
    const dateObj = startDate ? new Date(startDate.replace(/-/g, '/')) : null

    let date = startDate
    let weekday = ''
    if (dateObj && !isNaN(dateObj.getTime())) {
      const month = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      date = `${month}月${day}日`
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      weekday = weekDays[dateObj.getDay()]
    }

    return {
      id: c.id,
      name: c.name || '',
      date: date,
      weekday: weekday,
      time: '09:00-11:00', // 后端暂无具体时间字段，先用默认时间
      endDate: c.endDate || startDate,
      schedule: c.schedule || '',
      location: c.location || '',
      description: c.description || '',
      targetAge: '6-12岁儿童',
      capacity: c.capacity || 0,
      currentStudents: 0,
      teacherId: c.teacherId,
      price: c.price || 0,
      type: c.type || '托育课程'
    }
  },

  loadTeacherInfo(teacherId) {
    const openId = wx.getStorageSync('openId')
    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/teachers/${teacherId}`,
      method: 'GET',
      timeout: 10000,
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId || ''
      },
      success: (res) => {
        console.log('[course-detail] 教师信息响应:', res.statusCode, res.data)
        if (res.statusCode === 200) {
          this.setData({ teacher: res.data })
        }
      },
      fail: (err) => {
        console.error('[course-detail] 请求教师信息失败:', err)
        // 兜底：用默认教师信息
        this.setData({ teacher: { name: '小明', phone: '666666' } })
      }
    })
  },

  loadCurrentReservations(courseId) {
    const token = wx.getStorageSync('token')
    if (!token) return
    const openId = wx.getStorageSync('openId')

    wx.request({
      url: `${app.globalData.API_BASE_URL}/api/reservations?courseId=${courseId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': openId
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const count = (res.data || []).length
          const capacity = this.data.course ? this.data.course.capacity : 0
          this.setData({
            currentReservations: count,
            isFull: count >= capacity
          })
        }
      },
      fail: (err) => {
        console.error('获取预约人数失败', err)
      }
    })
  },

  // 检查是否已预约（路由：云端 / 本地）
  checkReservationStatus(courseId) {
    if (USE_CLOUD_RESERVATION) {
      this.checkCloudReservationStatus(courseId)
    } else {
      this.checkLocalReservationStatus(courseId)
    }
  },

  // 云端版：从云数据库查当前用户在此课程的预约
  checkCloudReservationStatus(courseId) {
    wx.cloud.callFunction({
      name: 'reservation',
      data: { action: 'myList', courseId: parseInt(courseId) }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        const myRes = res.result.data || []
        this.setData({
          isReserved: myRes.length > 0,
          reservedCount: myRes.length
        })
      }
    }).catch(err => {
      console.error('[云开发] 查询我的预约失败，回退到本地', err)
      this.checkLocalReservationStatus(courseId)
    })
  },

  // 本地版：从 storage 查
  checkLocalReservationStatus(courseId) {
    let myReservations = app.getUserStorage('myReservations')
    if (!Array.isArray(myReservations)) {
      myReservations = []
    }
    const reservedForThisCourse = myReservations.filter(r => String(r.courseId) === String(courseId))
    this.setData({
      isReserved: reservedForThisCourse.length > 0,
      reservedCount: reservedForThisCourse.length
    })
  },

  // 云端版：从云数据库查实时预约人数（跨用户共享）
  loadCloudReservationCount(courseId) {
    wx.cloud.callFunction({
      name: 'reservation',
      data: { action: 'count', courseId: parseInt(courseId) }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        const count = res.result.total
        const capacity = this.data.course ? this.data.course.capacity : 0
        // 更新缓存，其他页面进入时可先显示最新人数
        const cachedCounts = wx.getStorageSync('cloud_course_counts') || {}
        cachedCounts[courseId] = count
        wx.setStorageSync('cloud_course_counts', cachedCounts)
        this.setData({
          currentReservations: count,
          isFull: count >= capacity,
          capacityPercent: capacity > 0 ? Math.round(count / capacity * 100) : 0
        })
      }
    }).catch(err => {
      console.error('[云开发] 查询预约人数失败', err)
    })
  },

  // 预约 / 取消预约
  onReserveTap() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再使用预约功能',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }

    // 检查是否绑定儿童
    const children = this.data.children
    if (!children || children.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请先在"我的"页面绑定儿童后再预约课程',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去绑定',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/profile/profile' })
          }
        }
      })
      return
    }

    // 构建选择器数据：每个儿童标记是否已预约本课程
    const myReservations = app.getUserStorage('myReservations') || []
    const courseId = String(this.data.courseId)
    const pickerChildren = children.map(child => {
      const reserved = myReservations.some(r =>
        String(r.courseId) === courseId && String(r.childId) === String(child.id)
      )
      return {
        id: child.id,
        name: child.name,
        age: child.age,
        gender: child.gender,
        relation: child.relation,
        reserved: reserved
      }
    })

    this.setData({
      showChildPicker: true,
      pickerChildren: pickerChildren
    })
  },

  // 切换儿童的预约状态
  onToggleChildReserve(e) {
    const childId = e.currentTarget.dataset.id
    const pickerChildren = this.data.pickerChildren.map(child => {
      if (String(child.id) === String(childId)) {
        return { ...child, reserved: !child.reserved }
      }
      return child
    })
    this.setData({ pickerChildren: pickerChildren })
  },

  // 关闭儿童选择器
  onCancelChildPicker() {
    this.setData({ showChildPicker: false, pickerChildren: [] })
  },

  // 阻止事件冒泡（弹窗容器用）
  stopBubble() {
    // 什么都不做，只阻止 tap 事件冒泡到 mask
  },

  // 确认选择
  onConfirmChildPicker() {
    const { courseId, pickerChildren, course } = this.data

    if (this.data.isFull) {
      wx.showToast({ title: '课程人数已满，无法预约', icon: 'none' })
      return
    }

    // 读取已存在的预约（用于对比 + 活动日志 + 本地双写）
    let myReservations = app.getUserStorage('myReservations') || []

    // 记录操作前状态
    const beforeMap = {}
    myReservations.forEach(r => {
      if (String(r.courseId) === String(courseId)) {
        beforeMap[String(r.childId)] = r
      }
    })
    const beforeIds = Object.keys(beforeMap)
    const newReserved = pickerChildren.filter(c =>
      c.reserved && !beforeIds.includes(String(c.id))
    )
    const cancelled = pickerChildren.filter(c =>
      !c.reserved && beforeIds.includes(String(c.id))
    )

    // ===== 云开发模式：预约数据走云数据库（跨用户实时同步）=====
    if (USE_CLOUD_RESERVATION) {
      if (newReserved.length === 0 && cancelled.length === 0) {
        this.setData({ showChildPicker: false, pickerChildren: [] })
        wx.showToast({ title: '未做任何变更', icon: 'none' })
        return
      }

      wx.showLoading({ title: '处理中...' })
      const tasks = []

      newReserved.forEach(c => {
        tasks.push(wx.cloud.callFunction({
          name: 'reservation',
          data: {
            action: 'reserve',
            courseId: course.id,
            childId: c.id,
            childName: c.name,
            childAge: c.age,
            childGender: c.gender,
            childRelation: c.relation,
            courseInfo: {
              name: course.name, date: course.date, weekday: course.weekday,
              time: course.time, location: course.location,
              description: course.description, teacher: course.teacher,
              teacherPhone: course.teacherPhone, capacity: course.capacity
            }
          }
        }))
      })

      cancelled.forEach(c => {
        tasks.push(wx.cloud.callFunction({
          name: 'reservation',
          data: { action: 'cancel', courseId: course.id, childId: c.id }
        }))
      })

      Promise.all(tasks).then(results => {
        wx.hideLoading()

        let hasError = false
        let errorMsg = ''
        results.forEach(r => {
          if (r.result && r.result.code !== 0) {
            hasError = true
            errorMsg = r.result.msg
          }
        })

        if (hasError) {
          wx.showModal({ title: '部分操作失败', content: errorMsg, showCancel: false })
        }

        // 双写本地存储（保持历史课程等功能兼容）
        myReservations = myReservations.filter(r => String(r.courseId) !== String(courseId))
        pickerChildren.forEach(child => {
          if (child.reserved) {
            myReservations.push({
              courseId: course.id, courseName: course.name,
              childId: child.id, childName: child.name,
              childAge: child.age, childGender: child.gender,
              childRelation: child.relation, date: course.date,
              weekday: course.weekday, time: course.time,
              location: course.location, description: course.description,
              teacher: course.teacher, teacherPhone: course.teacherPhone,
              capacity: course.capacity, reservedAt: new Date().toLocaleString()
            })
          }
        })
        app.setUserStorage('myReservations', myReservations)

        // 活动日志
        newReserved.forEach(c => {
          app.recordActivityLog({
            type: 'course', title: '预约课程',
            summary: `已为「${c.name}」预约「${course.name}」（${course.date} ${course.time}）`,
            icon: '📅', color: '#4f7cff'
          })
        })
        cancelled.forEach(c => {
          app.recordActivityLog({
            type: 'course', title: '取消预约',
            summary: `已为「${c.name}」取消「${course.name}」`,
            icon: '❌', color: '#999'
          })
        })

        const reservedCount = pickerChildren.filter(c => c.reserved).length
        this.setData({
          isReserved: reservedCount > 0,
          reservedCount: reservedCount,
          showChildPicker: false,
          pickerChildren: []
        })
        this.loadCloudReservationCount(course.id)

        if (newReserved.length > 0 && cancelled.length === 0) {
          wx.showToast({ title: '预约成功', icon: 'success', duration: 2000 })
        } else if (newReserved.length === 0 && cancelled.length > 0) {
          wx.showToast({ title: `已取消 ${cancelled.length} 项预约`, icon: 'none' })
        } else {
          wx.showToast({ title: `预约 ${newReserved.length} 项，取消 ${cancelled.length} 项`, icon: 'none' })
        }
      }).catch(err => {
        wx.hideLoading()
        console.error('[云开发] 预约操作失败', err)
        wx.showModal({ title: '操作失败', content: '网络错误，请重试', showCancel: false })
      })
      return
    }

    // ===== 本地模式（原逻辑）=====
    // 移除当前课程的所有预约
    myReservations = myReservations.filter(r => String(r.courseId) !== String(courseId))

    // 添加新勾选的儿童预约
    pickerChildren.forEach(child => {
      if (child.reserved) {
        myReservations.push({
          courseId: course.id,
          courseName: course.name,
          childId: child.id,
          childName: child.name,
          childAge: child.age,
          childGender: child.gender,
          childRelation: child.relation,
          date: course.date,
          weekday: course.weekday,
          time: course.time,
          location: course.location,
          description: course.description,
          teacher: course.teacher,
          teacherPhone: course.teacherPhone,
          capacity: course.capacity,
          reservedAt: new Date().toLocaleString()
        })
      }
    })

    app.setUserStorage('myReservations', myReservations)

    // ========== 记录预约/取消活动日志 ==========
    newReserved.forEach(c => {
      app.recordActivityLog({
        type: 'course',
        title: '预约课程',
        summary: `已为「${c.name}」预约「${course.name}」（${course.date} ${course.time}）`,
        icon: '📅',
        color: '#4f7cff'
      })
    })

    cancelled.forEach(c => {
      app.recordActivityLog({
        type: 'course',
        title: '取消预约',
        summary: `已为「${c.name}」取消「${course.name}」`,
        icon: '❌',
        color: '#999'
      })
    })

    // 更新按钮状态
    const reservedCount = pickerChildren.filter(c => c.reserved).length
    this.setData({
      isReserved: reservedCount > 0,
      reservedCount: reservedCount,
      showChildPicker: false,
      pickerChildren: []
    })

    if (newReserved.length > 0 && cancelled.length === 0) {
      wx.showToast({ title: `预约成功`, icon: 'success', duration: 2000 })
    } else if (newReserved.length === 0 && cancelled.length > 0) {
      wx.showToast({ title: `已取消 ${cancelled.length} 项预约`, icon: 'none' })
    } else if (newReserved.length > 0 && cancelled.length > 0) {
      wx.showToast({ title: `预约 ${newReserved.length} 项，取消 ${cancelled.length} 项`, icon: 'none' })
    } else {
      wx.showToast({ title: '未做任何变更', icon: 'none' })
    }
  },

  makePhoneCall() {
    const phone = this.data.teacher ? this.data.teacher.phone : ''
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    }
  }
})