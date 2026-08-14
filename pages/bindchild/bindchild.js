// pages/bindchild/bindchild.js
const app = getApp()

// 儿童信息统一走后端（与网页管理端共用 child_info 表，按 X-WX-OPENID 隔离）
const USE_BACKEND_CHILDREN = true

function getOpenId() {
  return wx.getStorageSync('openId') || ''
}

Page({
  data: {
    children: [],
    showForm: false,
    formData: {
      name: '',
      age: '',
      gender: '男',
      relation: '',
      parentName: '',
      phoneNumber: '',
      address: '',
      grade: ''
    },
    genderOptions: ['男', '女']
  },

  onLoad: function () {
    this.loadChildren();
  },

  onShow: function () {
    this.loadChildren();
  },

  // 加载儿童列表（后端优先，本地缓存兜底）
  loadChildren: function () {
    const local = app.getUserStorage('myChildren') || []
    this.setData({ children: local })
    if (!USE_BACKEND_CHILDREN) return

    wx.request({
      url: app.globalData.API_BASE_URL + '/api/child/list',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': getOpenId()
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const list = (res.data.data || []).map(c => Object.assign({}, c, { id: c.id }))
          app.setUserStorage('myChildren', list)
          this.setData({ children: list })
        }
      },
      fail: () => {}
    })
  },

  // 显示添加表单
  onShowForm() {
    this.setData({
      showForm: true,
      formData: {
        name: '',
        age: '',
        gender: '男',
        relation: '',
        parentName: '',
        phoneNumber: '',
        address: '',
        grade: ''
      }
    });
  },

  // 隐藏表单
  onHideForm() {
    this.setData({ showForm: false });
  },

  // 阻止事件冒泡
  stopBubble() {
    // 什么都不做，只阻止 tap 事件冒泡
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  // 性别选择
  onGenderChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      'formData.gender': this.data.genderOptions[index]
    });
  },

  // 保存儿童
  onSaveChild() {
    const { name, age, gender, relation, parentName, phoneNumber, address, grade } = this.data.formData;

    if (!name.trim()) {
      wx.showToast({ title: '请输入儿童姓名', icon: 'none' });
      return;
    }
    if (!age.trim()) {
      wx.showToast({ title: '请输入年龄', icon: 'none' });
      return;
    }
    if (!relation.trim()) {
      wx.showToast({ title: '请输入与儿童关系', icon: 'none' });
      return;
    }

    const ageNum = parseInt(age, 10);
    // 后端 child_info 表 phoneNumber 等字段非空约束，留空时用 openId 兜底
    const payload = {
      childName: name.trim(),
      age: isNaN(ageNum) ? 0 : ageNum,
      gender: gender,
      relationship: relation.trim(),
      parentName: parentName.trim() || '未设置',
      phoneNumber: phoneNumber.trim() || getOpenId() || '00000000000'
    };

    if (!USE_BACKEND_CHILDREN) {
      const newChild = {
        childName: name.trim(), age: age.trim(), gender, relationship: relation.trim(),
        parentName: parentName.trim() || '未设置', phoneNumber: phoneNumber.trim(),
        address: address.trim(), grade: grade.trim(), avatar: '/images/default-avatar.png'
      };
      this.saveLocalFallback(newChild);
      this.setData({ showForm: false });
      wx.showToast({ title: '添加成功', icon: 'success' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    wx.request({
      url: app.globalData.API_BASE_URL + '/api/child/bind',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'X-WX-OPENID': getOpenId()
      },
      data: payload,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          const saved = res.data.data;
          const item = Object.assign({}, saved, { id: saved.id });
          let myChildren = app.getUserStorage('myChildren') || [];
          myChildren.push(item);
          app.setUserStorage('myChildren', myChildren);
          this.setData({ showForm: false, children: myChildren });
          wx.showToast({ title: '保存成功', icon: 'success' });
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '保存失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('[bindchild] 绑定儿童失败', err);
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      }
    });
  },

  // 本地兜底保存
  saveLocalFallback(newChild) {
    let myChildren = app.getUserStorage('myChildren') || [];
    newChild.id = 'child_' + Date.now();
    myChildren.push(newChild);
    app.setUserStorage('myChildren', myChildren);
    this.setData({ children: myChildren, showForm: false });
  },

  // 删除儿童
  onDeleteChild(e) {
    const childId = e.currentTarget.dataset.id;
    const childrenBefore = this.data.children;
    const targetChild = childrenBefore.find(c => String(c.id) === String(childId));
    const childName = targetChild ? targetChild.childName : '该儿童';

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个儿童信息吗？',
      success: (res) => {
        if (!res.confirm) return;

        if (USE_BACKEND_CHILDREN) {
          wx.showLoading({ title: '删除中...' });
          wx.request({
            url: app.globalData.API_BASE_URL + '/api/child/' + childId,
            method: 'DELETE',
            header: {
              'content-type': 'application/json',
              'X-WX-OPENID': getOpenId()
            },
            success: () => {
              wx.hideLoading();
              this.loadChildren();
              this.cleanupReservationsForChild(childId, childName);
              wx.showToast({ title: '已删除', icon: 'success' });
            },
            fail: () => {
              wx.hideLoading();
              this.deleteLocalFallback(childId, childName);
            }
          });
          return;
        }

        this.deleteLocalFallback(childId, childName);
      }
    });
  },

  // 本地兜底删除
  deleteLocalFallback(childId, childName) {
    let myChildren = app.getUserStorage('myChildren') || [];
    myChildren = myChildren.filter(c => String(c.id) !== String(childId));
    app.setUserStorage('myChildren', myChildren);
    this.setData({ children: myChildren });
    this.cleanupReservationsForChild(childId, childName);
    wx.showToast({ title: '已删除', icon: 'success' });
  },

  // 删除儿童后清理关联预约的本地缓存
  cleanupReservationsForChild(childId, childName) {
    let myReservations = app.getUserStorage('myReservations') || [];
    myReservations = myReservations.filter(r => String(r.childId) !== String(childId));
    app.setUserStorage('myReservations', myReservations);

    app.recordActivityLog({
      type: 'child',
      title: '删除儿童',
      summary: `已删除儿童「${childName}」`,
      icon: '🗑️',
      color: '#999'
    });
  }
});
