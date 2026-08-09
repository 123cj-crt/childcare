// pages/bindchild/bindchild.js
const app = getApp()

// 儿童信息云同步开关：true = 读写云端数据库（跨设备同步），false = 仅本地存储
const USE_CLOUD_CHILDREN = true

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

  // 加载儿童列表（云端优先，本地缓存兜底）
  loadChildren: function () {
    const local = app.getUserStorage('myChildren') || []
    this.setData({ children: local })
    if (!USE_CLOUD_CHILDREN) return

    app.loadChildrenFromCloud().then(list => {
      this.setData({ children: list })
    }).catch(() => {})
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

    const newChild = {
      name: name.trim(),
      age: age.trim(),
      gender: gender,
      relation: relation.trim(),
      parentName: parentName.trim() || '未设置',
      phoneNumber: phoneNumber.trim() || '',
      address: address.trim() || '',
      grade: grade.trim() || '',
      avatar: '/images/default-avatar.png'
    };

    if (USE_CLOUD_CHILDREN) {
      wx.showLoading({ title: '保存中...' });
      wx.cloud.callFunction({
        name: 'children',
        data: { action: 'add', child: newChild }
      }).then(res => {
        wx.hideLoading();
        if (res.result && res.result.code === 0) {
          // 云端保存成功：把返回的 _id 作为 id 写入本地缓存并立即显示
          const savedChild = Object.assign({}, newChild, { id: res.result._id })
          let myChildren = app.getUserStorage('myChildren') || []
          myChildren.push(savedChild)
          app.setUserStorage('myChildren', myChildren)
          this.setData({ showForm: false, children: myChildren })
          wx.showToast({ title: '云端保存成功', icon: 'success' })
        } else {
          // 云端失败，兜底存本地
          this.saveLocalFallback(newChild)
          wx.showToast({ title: '已存本地（云端未同步）', icon: 'none' })
        }
      }).catch((err) => {
        wx.hideLoading();
        console.error('[bindchild] 添加儿童云函数失败:', err)
        this.saveLocalFallback(newChild)
        wx.showToast({ title: '网络异常，已存本地', icon: 'none' })
      });
      return;
    }

    // 本地模式
    this.saveLocalFallback(newChild);
    this.setData({ showForm: false });
    wx.showToast({ title: '添加成功', icon: 'success' });
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
    const childName = targetChild ? targetChild.name : '该儿童';

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个儿童信息吗？删除后所有设备都将同步移除',
      success: (res) => {
        if (!res.confirm) return;

        if (USE_CLOUD_CHILDREN) {
          wx.showLoading({ title: '删除中...' });
          wx.cloud.callFunction({
            name: 'children',
            data: { action: 'remove', id: childId }
          }).then(res2 => {
            wx.hideLoading();
            if (res2.result && res2.result.code === 0) {
              this.loadChildren();
              this.cleanupReservationsForChild(childId, childName);
              wx.showToast({ title: '已删除', icon: 'success' });
            } else {
              this.deleteLocalFallback(childId, childName);
            }
          }).catch(() => {
            wx.hideLoading();
            this.deleteLocalFallback(childId, childName);
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

  // 删除儿童后清理关联预约的本地缓存（云端记录由 reservation 云函数单独取消）
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
