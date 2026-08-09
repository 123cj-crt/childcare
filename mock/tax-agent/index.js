const recommendedQuestions = [
  '税收是什么？',
  '发票有什么作用？',
  '公园和图书馆的钱从哪里来？',
  '怎样合理消费和储蓄？'
];

const knowledgeCards = [
  {
    id: 'tax',
    icon: '税',
    title: '什么是税收',
    summary: '大家按规则交的一小部分钱，会一起用在公共服务上。',
    detail: '税收像一个大家共用的小储蓄罐，可以帮助建设道路、学校、公园和医院。'
  },
  {
    id: 'invoice',
    icon: '票',
    title: '发票有什么作用',
    summary: '发票是购买商品或服务时的重要凭证。',
    detail: '它能记录买了什么、花了多少钱，也提醒商家按规则经营。'
  },
  {
    id: 'public',
    icon: '城',
    title: '公共设施的钱从哪里来',
    summary: '一部分来自大家共同缴纳的税收。',
    detail: '路灯、图书馆、公交站等公共设施，能让我们的生活更方便。'
  },
  {
    id: 'saving',
    icon: '存',
    title: '合理消费与储蓄',
    summary: '先想清楚需要什么，再安排零花钱。',
    detail: '把一部分钱留给未来的小目标，也是一种聪明的生活习惯。'
  }
];

const quizQuestions = [
  {
    id: 1,
    question: '下面哪一项更像公共设施？',
    options: ['图书馆', '自己的玩具', '家里的书桌'],
    correctOption: 0,
    explanation: '图书馆供大家一起使用，是公共设施。'
  },
  {
    id: 2,
    question: '买东西后收到发票，最合适的做法是？',
    options: ['随手丢掉', '先保存好', '涂鸦后送人'],
    correctOption: 1,
    explanation: '发票是重要凭证，可以先妥善保存。'
  },
  {
    id: 3,
    question: '判断题：合理消费就是想买什么就买什么。',
    options: ['正确', '错误'],
    correctOption: 1,
    explanation: '合理消费要先分清需要和想要，还要做好计划。'
  }
];

function getMockReply(question) {
  if (question.indexOf('发票') !== -1) {
    return '发票像购物的小收据，能记录买了什么和花了多少钱，要记得保存好哦。';
  }
  if (question.indexOf('税') !== -1 || question.indexOf('公共') !== -1) {
    return '税收是大家按规则交的一部分钱，可以一起建设学校、公园和道路，让生活更方便。';
  }
  if (question.indexOf('消费') !== -1 || question.indexOf('储蓄') !== -1) {
    return '可以把零花钱分成“需要花”和“留给目标”两部分，先计划再购买，会更有成就感。';
  }
  return '这是一个很好的问题！我们可以从身边的小事开始观察：买东西、坐公交、去公园，都和公共服务有关。';
}

module.exports = {
  recommendedQuestions,
  knowledgeCards,
  quizQuestions,
  getMockReply
};
