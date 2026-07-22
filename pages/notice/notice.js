const app = getApp();
Page({
  data: {
    // 各类通知未读数量（改用英文key兼容wxml渲染）
    noticeCount: {
      notice1: 2,
      notice2: 2,
      notice3: 1
    },
    // 模拟全部通知数据，真实项目替换接口请求
    allNoticeData: {
      "公告通知": [
        { id: 1, title: "7月园区放假通知", time: "2026-07-20", content: "本周六、周日园区全天放假，家长无需送孩子入园。" },
        { id: 2, title: "暑期兴趣班报名开启", time: "2026-07-19", content: "美术、音乐、体能课程开放报名，名额有限。" }
      ],
      "孩子沟通": [
        { id: 1, title: "小明今日课堂表现", time: "2026-07-20", content: "今日美术课积极举手，涂色很有想象力。" },
        { id: 2, title: "小红午餐情况反馈", time: "2026-07-19", content: "今日午餐全部吃完，午睡时长1小时20分。" }
      ],
      "系统通知": [
        { id: 1, title: "课程时间调整提醒", time: "2026-07-20", content: "周三科学课调整为上午10:30开始。" }
      ]
    }
  },

  onLoad() {

  },

  // 点击分类跳转通知列表页
  goNoticeList(e) {
    const type = e.currentTarget.dataset.type;
    const icon = e.currentTarget.dataset.icon;
    const color = e.currentTarget.dataset.color;
    const list = this.data.allNoticeData[type];

    // 携带参数跳转到通知详情列表页
    wx.navigateTo({
      url: `/pages/notice-list/notice-list?type=${encodeURIComponent(type)}&icon=${encodeURIComponent(icon)}&color=${encodeURIComponent(color)}`
    })
  }
})