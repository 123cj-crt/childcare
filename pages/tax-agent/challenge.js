const QUIZ_TOPICS = [
  { code: 'tax', icon: '税', title: '税收与公共服务', desc: '学校、公园、医院和道路', count: 4 },
  { code: 'invoice', icon: '票', title: '发票小知识', desc: '购物记录和消费保护', count: 3 },
  { code: 'budget', icon: '钱', title: '零花钱与预算', desc: '压岁钱、储蓄和合理消费', count: 5 }
];

Page({
  data: { topics: QUIZ_TOPICS },
  chooseTopic(event) {
    const topic = QUIZ_TOPICS.find((item) => item.code === event.currentTarget.dataset.topic);
    if (!topic) return;
    wx.navigateTo({ url: `/pages/tax-agent/challenge-quiz?topic=${topic.code}` });
  }
});
