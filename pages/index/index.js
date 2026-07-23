const { API_BASE_URL, request } = require('../../utils/request');

function getSampleBanners() {
  return [
    { id: 1, image: '/images/1.jpg', title: '智慧托育中心', link: 'https://mp.weixin.qq.com/s/example1' },
    { id: 2, image: '/images/2.jpg', title: '育儿专家分享', link: 'https://mp.weixin.qq.com/s/example2' },
    { id: 3, image: '/images/3.jpg', title: '最新活动资讯', link: 'https://mp.weixin.qq.com/s/example3' }
  ];
}

Page({
  data: {
    banners: [],
    courses: [],
    hasShownFallbackNotice: false
  },

  onLoad() {
    this.fetchCourses();
    this.fetchBanners();
  },

  onShow() {
    this.fetchCourses();
    this.fetchBanners();
  },

  goToCourseDetail(e) {
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${e.currentTarget.dataset.id}`
    });
  },

  onBannerTap(e) {
    const { link, title } = e.currentTarget.dataset;
    if (!link) {
      wx.showToast({ title: '推文链接不存在', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title || '公众号推文')}`,
      fail: () => {
        wx.setClipboardData({
          data: link,
          success: () => wx.showModal({
            title: '链接已复制',
            content: '请在微信中打开链接查看详情。',
            showCancel: false
          })
        });
      }
    });
  },

  fetchBanners() {
    request({ path: '/api/tweets' })
      .then((response) => {
        const tweets = Array.isArray(response.data) ? response.data : [];
        if (tweets.length === 0) {
          this.setData({ banners: getSampleBanners() });
          return;
        }

        this.setData({
          banners: tweets.map((tweet, index) => ({
            id: tweet.id || index + 1,
            image: this.processImageUrl(tweet.image),
            title: tweet.title || `推文 ${tweet.id || index + 1}`,
            link: tweet.link
          }))
        });
      })
      .catch((error) => {
        console.warn('[首页] 轮播图接口不可用，已显示示例数据。', error);
        this.setData({ banners: getSampleBanners() });
        this.showFallbackNotice();
      });
  },

  fetchCourses() {
    request({ path: '/api/courses' })
      .then((response) => {
        const courses = Array.isArray(response.data) ? response.data : [];
        this.setData({ courses: courses.length > 0 ? courses : this.getSampleCourses() });
      })
      .catch((error) => {
        console.warn('[首页] 课程接口不可用，已显示示例数据。', error);
        this.setData({ courses: this.getSampleCourses() });
        this.showFallbackNotice();
      });
  },

  showFallbackNotice() {
    if (this.data.hasShownFallbackNotice) {
      return;
    }

    this.setData({ hasShownFallbackNotice: true });
    wx.showToast({ title: '后端不可用，已显示示例数据', icon: 'none' });
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const banners = this.data.banners.slice();
    if (banners[index]) {
      banners[index].image = '/images/1.jpg';
      this.setData({ banners });
    }
  },

  processImageUrl(imageUrl) {
    if (!imageUrl) {
      return '/images/1.jpg';
    }

    if (/^https?:\/\//.test(imageUrl)) {
      return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  },

  getSampleCourses() {
    return [
      {
        id: 1,
        name: '创意美术课',
        startDate: '2024-01-15',
        schedule: '周一 09:00-10:30',
        description: '通过绘画和手工活动培养孩子的艺术创造力。'
      },
      {
        id: 2,
        name: '音乐启蒙课',
        startDate: '2024-01-16',
        schedule: '周二 14:00-15:30',
        description: '通过音乐游戏和节奏训练培养音乐感知能力。'
      },
      {
        id: 3,
        name: '科学探索课',
        startDate: '2024-01-17',
        schedule: '周三 10:00-11:30',
        description: '通过有趣实验激发好奇心和探索精神。'
      },
      {
        id: 4,
        name: '运动体能课',
        startDate: '2024-01-18',
        schedule: '周四 15:00-16:30',
        description: '通过运动游戏提升身体素质和协调能力。'
      }
    ];
  }
});
