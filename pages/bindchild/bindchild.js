// pages/bindchild/bindchild.js
const app = getApp()

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
      phoneNumber: ''
    },
    genderOptions: ['男', '女']
  },

  onLoad: function () {
    this.loadChildren();
  },

  onShow: function () {
    this.loadChildren();
  },

  // 从本地存储加载儿童列表
  loadChildren: function () {
    const myChildren = app.getUserStorage('myChildren') || [];
    this.setData({ children: myChildren });
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
        phoneNumber: ''
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
    const { name, age, gender, relation, parentName, phoneNumber } = this.data.formData;

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

    let myChildren = app.getUserStorage('myChildren') || [];

    const newChild = {
      id: 'child_' + Date.now(),
      name: name.trim(),
      age: age.trim(),
      gender: gender,
      relation: relation.trim(),
      parentName: parentName.trim() || '未设置',
      phoneNumber: phoneNumber.trim() || '',
      avatar: '/images/default-avatar.png'
    };

    myChildren.push(newChild);
    app.setUserStorage('myChildren', myChildren);

    // 记录添加儿童日志
    app.recordActivityLog({
      type: 'child',
      title: '添加儿童',
      summary: `已成功添加儿童「${newChild.name}」（${newChild.age}岁，${newChild.gender}）`,
      icon: '👶',
      color: '#52c41a'
    });

    this.setData({
      children: myChildren,
      showForm: false
    });

    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  // 删除儿童
  onDeleteChild(e) {
    const childId = e.currentTarget.dataset.id;
    // 先查一下要删除的儿童姓名（用于日志记录）
    const myChildrenBefore = app.getUserStorage('myChildren') || [];
    const targetChild = myChildrenBefore.find(c => String(c.id) === String(childId));
    const childName = targetChild ? targetChild.name : '该儿童';

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个儿童信息吗？',
      success: (res) => {
        if (res.confirm) {
          let myChildren = app.getUserStorage('myChildren') || [];
          myChildren = myChildren.filter(c => String(c.id) !== String(childId));
          app.setUserStorage('myChildren', myChildren);

          // 同时清理该儿童的所有预约
          let myReservations = app.getUserStorage('myReservations') || [];
          const beforeCount = myReservations.length;
          myReservations = myReservations.filter(r => String(r.childId) !== String(childId));
          app.setUserStorage('myReservations', myReservations);

          // 记录删除儿童日志
          app.recordActivityLog({
            type: 'child',
            title: '删除儿童',
            summary: `已删除儿童「${childName}」，关联 ${beforeCount - myReservations.length} 条预约`,
            icon: '🗑️',
            color: '#999'
          });

          this.setData({ children: myChildren });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});