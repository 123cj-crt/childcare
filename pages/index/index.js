// index.js
const app = getApp();

Page({
  data: {
    banners: [],
    courses: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.fetchCourses();
    this.fetchBanners();
  },
  onShow() {
    this.fetchCourses();
    this.fetchBanners();
    // 添加调试信息
    this.debugImageUrls();
  },
  goToCourseDetail(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${courseId}`
    });
  },
  // 轮播图点击事件
  onBannerTap(e) {
    const link = e.currentTarget.dataset.link;
    const title = e.currentTarget.dataset.title;
    
    console.log('轮播图点击事件:', { link, title });
    
    if (link) {
      const webviewUrl = `/pages/webview/webview?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title || '微信公众号推文')}`;
      console.log('准备跳转到webview:', webviewUrl);
      
      // 直接跳转到微信公众号推文
      wx.navigateTo({
        url: webviewUrl,
        success: () => {
          console.log('成功跳转到webview页面');
        },
        fail: (error) => {
          console.error('跳转到webview失败:', error);
          // 如果webview页面不存在，则复制链接
          wx.setClipboardData({
            data: link,
            success: () => {
              wx.showModal({
                title: '链接已复制',
                content: `已复制微信公众号推文链接到剪贴板，请在微信中打开链接查看详情。`,
                showCancel: false,
                confirmText: '知道了'
              });
            },
            fail: () => {
              wx.showToast({
                title: '跳转失败',
                icon: 'none'
              });
            }
          });
        }
      });
    } else {
      console.log('没有找到推文链接');
      wx.showToast({
        title: '推文链接不存在',
        icon: 'none'
      });
    }
  },
  // 获取轮播图数据
  fetchBanners() {
    try {
      wx.request({
        url: `${app.globalData.API_BASE_URL}/api/tweets`,
        method: 'GET',
        success: (res) => {
          console.log('Fetched banners data from backend:', res.data);
          if (res.statusCode === 200 && Array.isArray(res.data)) {
            // 将推文数据转换为轮播图格式
            const tweets = res.data;
            const banners = tweets.map((tweet, index) => ({
              id: tweet.id || index + 1,
              image: this.processImageUrl(tweet.image),
              title: tweet.title || `推文 ${tweet.id}`,
              link: tweet.link
            }));
            console.log('Processed banners:', banners);
            console.log('Banner images after processing:', banners.map(b => b.image));
            this.setData({
              banners: banners
            });
          } else {
            // 如果后端没有数据，使用3张本地默认轮播图（对应3张图片）
            this.setData({
              banners: [
                { 
                  id: 1, 
                  image: '/images/1.jpg',
                  title: '智慧托育中心',
                  link: 'https://mp.weixin.qq.com/s/example1'
                },
                { 
                  id: 2, 
                  image: '/images/2.jpg',
                  title: '育儿专家分享',
                  link: 'https://mp.weixin.qq.com/s/example2'
                },
                { 
                  id: 3, 
                  image: '/images/3.jpg',
                  title: '最新活动资讯',
                  link: 'https://mp.weixin.qq.com/s/example3'
                }
              ]
            });
          }
        },
        fail: (error) => {
          console.error('获取轮播图数据失败:', error);
          console.log('API URL:', `${app.globalData.API_BASE_URL}/api/tweets`);
          wx.showToast({
            title: '获取推文失败',
            icon: 'none'
          });
          // 请求失败加载3张本地轮播图
          this.setData({
            banners: [
              { 
                id: 1, 
                image: '/images/1.jpg',
                title: '智慧托育中心',
                link: 'https://mp.weixin.qq.com/s/example1'
              },
              { 
                id: 2, 
                image: '/images/2.jpg',
                title: '育儿专家分享',
                link: 'https://mp.weixin.qq.com/s/example2'
              },
              { 
                id: 3, 
                image: '/images/3.jpg',
                title: '最新活动资讯',
                link: 'https://mp.weixin.qq.com/s/example3'
              }
            ]
          });
        }
      });
    } catch (error) {
      console.error('获取轮播图数据失败:', error);
      // 异常兜底3张本地轮播图
      this.setData({
        banners: [
          { 
            id: 1, 
            image: '/images/1.jpg',
            title: '智慧托育中心',
            link: 'https://mp.weixin.qq.com/s/example1'
          },
          { 
            id: 2, 
            image: '/images/2.jpg',
            title: '育儿专家分享',
            link: 'https://mp.weixin.qq.com/s/example2'
          },
          { 
            id: 3, 
            image: '/images/3.jpg',
            title: '最新活动资讯',
            link: 'https://mp.weixin.qq.com/s/example3'
          }
        ]
      });
    }
  },
  // 调试图片URL
  debugImageUrls() {
    console.log('=== 图片URL调试信息 ===');
    console.log('API基础URL:', app.globalData.API_BASE_URL);
    console.log('当前banners数据:', this.data.banners);
    if (this.data.banners && this.data.banners.length > 0) {
      this.data.banners.forEach((banner, index) => {
        console.log(`Banner ${index}:`, {
          id: banner.id,
          image: banner.image,
          title: banner.title,
          link: banner.link
        });
      });
    }
    console.log('=== 调试信息结束 ===');
  },
  // 图片加载错误处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    console.log('图片加载失败，索引:', index, '图片URL:', this.data.banners[index].image);
    
    // 使用第一张图做兜底替换
    const banners = this.data.banners;
    banners[index].image = '/images/1.jpg';
    this.setData({
      banners: banners
    });
    
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
    });
  },
  // 处理图片URL，确保小程序能正确访问
  processImageUrl(imageUrl) {
    if (!imageUrl) {
      return '/images/1.jpg'; // 默认图片
    }
    
    // 如果是相对路径，添加API基础URL
    if (imageUrl.startsWith('/uploads/')) {
      return `${app.globalData.API_BASE_URL}${imageUrl}`;
    }
    
    // 如果是完整URL，直接返回
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // 其他情况，添加API基础URL
    return `${app.globalData.API_BASE_URL}${imageUrl}`;
  },
  fetchCourses() {
      try {
          wx.request({
            url: `${app.globalData.API_BASE_URL}/api/courses`,
            method: 'GET',
            success: (res) => {
              console.log('Fetched courses data from backend:', res.data);
              if (res.statusCode === 200 && res.data && res.data.length > 0) {
                this.setData({
                  courses: res.data
                });
              } else {
                console.log('后端无课程数据，使用示例数据');
                this.setData({
                  courses: this.getSampleCourses()
                });
              }
            },
            fail: (error) => {
              console.error('获取课程数据失败:', error);
              console.log('使用示例课程数据');
              this.setData({
                courses: this.getSampleCourses()
              });
            }
          });
      } catch (error) {
          console.error('获取课程数据失败:', error);
          console.log('使用示例课程数据');
          this.setData({
            courses: this.getSampleCourses()
          });
      }
  },

  // 获取示例课程数据
  getSampleCourses() {
    return [
      {
        id: 1,
        name: '创意美术课',
        startDate: '2024-01-15',
        schedule: '周一 09:00-10:30',
        description: '培养孩子的艺术创造力和审美能力，通过绘画、手工等方式激发想象力。',
        price: 120,
        maxStudents: 15,
        currentStudents: 8
      },
      {
        id: 2,
        name: '音乐启蒙课',
        startDate: '2024-01-16',
        schedule: '周二 14:00-15:30',
        description: '通过音乐游戏、节奏训练等方式，培养孩子的音乐感知能力和协调性。',
        price: 100,
        maxStudents: 12,
        currentStudents: 10
      },
      {
        id: 3,
        name: '科学探索课',
        startDate: '2024-01-17',
        schedule: '周三 10:00-11:30',
        description: '通过有趣的科学实验，培养孩子的好奇心和探索精神，学习基础科学知识。',
        price: 150,
        maxStudents: 10,
        currentStudents: 6
      },
      {
        id: 4,
        name: '运动体能课',
        startDate: '2024-01-18',
        schedule: '周四 15:00-16:30',
        description: '通过各种运动游戏和体能训练，增强孩子的身体素质和协调能力。',
        price: 80,
        maxStudents: 20,
        currentStudents: 15
      }
    ];
  },
})