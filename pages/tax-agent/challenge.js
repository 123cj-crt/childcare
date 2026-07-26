const QUIZ_TOPICS = [
  { code: 'personal-income-tax', icon: '个', title: '个人所得税', desc: '工资和压岁钱的小问题', count: 10 },
  { code: 'resource-tax', icon: '源', title: '资源税', desc: '认识资源，学会珍惜', count: 10 },
  { code: 'life-tax-fees', icon: '生', title: '生活中的税费', desc: '买车买房和日常消费', count: 10 },
  { code: 'public-service', icon: '税', title: '税收与公共服务', desc: '学校、公园、医院和道路', count: 10 },
  { code: 'invoice', icon: '票', title: '发票大揭秘', desc: '购物记录和消费保护', count: 10 }
];

Page({
  data: { topics: QUIZ_TOPICS },
  chooseTopic(event) {
    const topic = QUIZ_TOPICS.find((item) => item.code === event.currentTarget.dataset.topic);
    if (!topic) return;
    wx.navigateTo({ url: `/pages/tax-agent/challenge-quiz?topic=${topic.code}` });
  }
});
