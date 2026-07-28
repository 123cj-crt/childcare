const QUIZ_TOPICS = [
  { code: 'personal-income-tax', iconImage: '/images/tax-agent/challenge-topic/personal-income.png', title: '个人所得税', desc: '工资和压岁钱的小问题', count: 10 },
  { code: 'resource-tax', iconImage: '/images/tax-agent/challenge-topic/resource.png', title: '资源税', desc: '认识资源，学会珍惜', count: 10 },
  { code: 'life-tax-fees', iconImage: '/images/tax-agent/challenge-topic/life-tax-fees.png', title: '生活中的税费', desc: '买车买房和日常消费', count: 10 },
  { code: 'public-service', iconImage: '/images/tax-agent/challenge-topic/public-service.png', title: '税收与公共服务', desc: '学校、公园、医院和道路', count: 10 },
  { code: 'invoice', iconImage: '/images/tax-agent/challenge-topic/invoice.png', title: '发票大揭秘', desc: '购物记录和消费保护', count: 10 }
];

Page({
  data: { topics: QUIZ_TOPICS },
  chooseTopic(event) {
    const topic = QUIZ_TOPICS.find((item) => item.code === event.currentTarget.dataset.topic);
    if (!topic) return;
    wx.navigateTo({ url: `/pages/tax-agent/challenge-quiz?topic=${topic.code}` });
  }
});
