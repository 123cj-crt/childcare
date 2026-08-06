// pages/profile/profile.js
const app = getApp()

// 微信官方默认头像（未设置头像前显示）
const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    avatarUrl: DEFAULT_AVATAR,
    nickName: '未登录',
    isLoggedIn: false,
    isEditing: false,
    editAvatarUrl: '',
    editNickName: ''
  },

  onLoad: function () {
    this.checkLoginStatus();
  },

  onShow: function () {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');

    // 只要 token 存在且非空，就认为已登录
    const hasValidToken = token && String(token).trim() !== '';

    if (hasValidToken && userInfo && userInfo.nickName) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || DEFAULT_AVATAR,
        nickName: userInfo.nickName,
        isLoggedIn: true
      });

      // 登录时写入的 need_profile_setup 标记，提示需要完善资料
      // 用 storage 级标记（而非页面实例标记），避免页面实例缓存导致弹窗不触发
      const needSetup = wx.getStorageSync('need_profile_setup');
      if (needSetup && !this.data.isEditing) {
        // 先清除标记，防止重复弹窗
        wx.removeStorageSync('need_profile_setup');
        setTimeout(() => {
          this.startEdit();
        }, 400);
      }
    } else {
      this.setData({
        avatarUrl: DEFAULT_AVATAR,
        nickName: '未登录',
        isLoggedIn: false
      });
    }
  },

  // ===== 编辑资料功能 =====
  // 进入编辑模式
  startEdit: function () {
    this.setData({
      isEditing: true,
      editAvatarUrl: this.data.avatarUrl,
      editNickName: this.data.nickName
    });
  },

  // 取消编辑
  cancelEdit: function () {
    this.setData({ isEditing: false });
  },

  // 阻止冒泡（避免点击弹窗内容时关闭弹窗）
  stopBubble: function () {},

  // 选择头像（新版微信 API）
  onChooseAvatar: function (e) {
    const avatarUrl = e.detail.avatarUrl;
    if (avatarUrl) {
      this.setData({ editAvatarUrl: avatarUrl });
      console.log('✅ 选择了新头像:', avatarUrl);
    }
  },

  // 输入昵称（新版微信 type="nickname" 输入框）
  onNicknameInput: function (e) {
    // 实时同步用户键入的值（可能不会在"用微信昵称"按钮点击时触发，但手输字符会触发）
    this.setData({ editNickName: e.detail.value });
  },

  onNicknameBlur: function (e) {
    // input 失焦（包括点"用微信昵称"后失焦）时同步最新值
    this.setData({ editNickName: e.detail.value });
  },

  // 保存资料
  saveProfile: function () {
    // 关键：避开单向绑定的坑——直接读 input 元素的真实最新值
    // （"用微信昵称"按钮自动填值不会触发 bindblur，data 可能落后于 input 实际值）
    const query = wx.createSelectorQuery().in(this);
    query.select('#nickname-input').fields({ value: true });
    query.exec((res) => {
      const realNickName = (res && res[0] && res[0].value) || this.data.editNickName || '';

      if (!realNickName || !realNickName.trim()) {
        wx.showToast({ title: '昵称不能为空', icon: 'none' });
        return;
      }

      const userInfo = {
        avatarUrl: this.data.editAvatarUrl || DEFAULT_AVATAR,
        nickName: realNickName.trim()
      };

      wx.setStorageSync('userInfo', userInfo);
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        isEditing: false
      });

      wx.showToast({ title: '保存成功', icon: 'success' });
    });
  },

  // 跳转到登录页面
  goToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 显示登录提示弹窗
  showLoginPrompt: function () {
    wx.showModal({
      title: '提示',
      content: '请先登录后再使用此功能',
      showCancel: true,
      cancelText: '取消',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          this.goToLogin();
        }
      }
    });
  },

  viewChildren() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.navigateTo({
      url: '/pages/bindchild/bindchild'
    });
  },

  // 我的预约课程 —— 跳转到预约列表页
  myCourses() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.navigateTo({
      url: '/pages/my-reservations/my-reservations'
    });
  },

  // 查看历史课程 —— 跳转到历史课程列表页
  viewHistory() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.navigateTo({
      url: '/pages/history-courses/history-courses'
    });
  },

  // 退出登录
  logout() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }

    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 只清除登录相关的存储，保留其他数据
          wx.removeStorageSync('token');
          wx.removeStorageSync('openId');
          wx.removeStorageSync('userInfo');

          this.setData({
            isLoggedIn: false,
            nickName: '未登录',
            avatarUrl: DEFAULT_AVATAR
          });

          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  contactUs: function () {
    wx.showModal({
      title: '联系我们',
      content: '请拨打客服热线：123-4567-8901',
      showCancel: false
    });
  }
})