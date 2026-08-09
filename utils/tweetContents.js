// utils/tweetContents.js
// 推文（轮播图）原生详情内容。
// 后端 /api/tweets 目前只返回 image/title/link，没有正文，
// 所以正文先放在本地，按 id 索引。后续若后端提供正文接口可平滑切换。
// blocks 中每项：
//   { type: 'text', text: '段落文字' }
//   { type: 'image', src: '/images/xxx.jpg' }

const TWEET_CONTENTS = {
  1: {
    title: '智慧托育中心',
    cover: '/images/1.jpg',
    summary: '以爱为基、以智为翼，为 0-3 岁婴幼儿打造家门口的成长乐园。',
    link: 'https://m.jyrmt.com/mob/2025/0831/83206.html?isDM=1&t=3730',
    blocks: [
      { type: 'text', text: '智慧托育中心坐落于社区核心地段，致力于为 0-3 岁婴幼儿提供安全、科学、有温度的照护服务。我们秉持"养教合一"的理念，让孩子在游戏与探索中自然成长。' },
      { type: 'text', text: '中心配备专业育婴师与早教师团队，师生比优于行业标准，提供全日托、半日托、临时托等灵活模式，满足不同家庭的照护需求。' },
      { type: 'image', src: '/images/1.jpg' },
      { type: 'text', text: '在课程之外，我们尤为重视家园共育。每周推送成长档案、每月举办亲子活动，让家长清晰看见孩子的每一步进步。' },
      { type: 'text', text: '选择智慧托育，就是为孩子选择一个被温柔以待的起点。欢迎预约到园参观，亲自感受这里的温度。' }
    ]
  },
  2: {
    title: '税理奇妙课堂',
    cover: '/images/2.jpg',
    summary: '趣味财税启蒙，让孩子从小懂规则、会思考、明是非。',
    link: 'https://mp.weixin.qq.com/s/hsGNAtJXbq6wHB2jQI4yBQ',
    blocks: [
      { type: 'text', text: '"税理奇妙课堂"是一档面向少年儿童的财税科普栏目。我们用漫画、故事和互动游戏，把"税收从哪里来、用到哪里去"讲得明明白白。' },
      { type: 'text', text: '税收并非遥不可及的概念。马路上的路灯、公园里的长椅、免费开放的图书馆，背后都有税收的影子。理解税收，就是理解我们共同生活的社会。' },
      { type: 'image', src: '/images/2.jpg' },
      { type: 'text', text: '课堂采用"场景+问题"的教学方式：假如城市要建一座新桥，钱从哪里来？通过一次次讨论，孩子们建立起对公共财政的初步认知。' },
      { type: 'text', text: '我们相信，财经素养和读写算一样，是面向未来的底层能力。奇妙课堂，陪孩子迈出财经启蒙的第一步。' }
    ]
  },
  3: {
    title: '财税启蒙之旅',
    cover: '/images/3.jpg',
    summary: '一段穿越账本与市场的奇遇，让知识在旅途中生根发芽。',
    link: 'https://mp.weixin.qq.com/s/uL6q4FX0CuAjtSXkCGz2cg',
    blocks: [
      { type: 'text', text: '"财税启蒙之旅"以一场奇妙的旅程为线索，带领孩子们从"小卖部"走到"大市场"，认识货币、价格与交换的奥秘。' },
      { type: 'text', text: '在旅途中，孩子们会遇见"记账小精灵"，学会把每一笔收入和支出记下来；也会遇到"储蓄巨人"，明白积少成多的力量。' },
      { type: 'image', src: '/images/3.jpg' },
      { type: 'text', text: '我们刻意避免说教，而是把知识点藏在任务和关卡里。孩子在"玩"中自然建立起预算、储蓄与合理消费的意识。' },
      { type: 'text', text: '启蒙不是灌输，而是点亮。愿这段旅程，成为孩子认识世界的一扇窗。' }
    ]
  }
}

function getTweetContent(id) {
  if (id === undefined || id === null) return null
  return TWEET_CONTENTS[String(id)] || TWEET_CONTENTS[id] || null
}

module.exports = { TWEET_CONTENTS, getTweetContent }
