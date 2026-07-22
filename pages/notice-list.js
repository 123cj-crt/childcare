Page({
  data: {
    pageType: "",
    pageIcon: "",
    pageColor: "",
    noticeList: []
  },
  onLoad(options) {
    const type = decodeURIComponent(options.type);
    const icon = decodeURIComponent(options.icon);
    const color = decodeURIComponent(options.color);
    // 读取父页面传过来的通知数据
    const allData = getApp().globalData.noticeData || {
      "公告通知": [
        { id:1, title:"7月园区放假通知", time:"2026-07-20", content:"本周六、周日园区全天放假，家长无需送孩子入园。" },
        { id:2, title:"暑期兴趣班报名开启", time:"2026-07-19", content:"美术、音乐、体能课程开放报名，名额有限。" }
      ],
      "孩子沟通": [
        { id:1, title:"小明今日课堂表现", time:"2026-07-20", content:"今日美术课积极举手，涂色很有想象力。" },
        { id:2, title:"小红午餐情况反馈", time:"2026-07-19", content:"今日午餐全部吃完，午睡时长1小时20分。" }
      ],
      "系统通知": [
        { id:1, title:"课程时间调整提醒", time:"2026-07-20", content:"周三科学课调整为上午10:30开始。" }
      ]
    };
    const list = allData[type] || [];
    this.setData({
      pageType: type,
      pageIcon: icon,
      pageColor: color,
      noticeList: list
    })
  }
})