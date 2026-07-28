const TAB_ITEMS = [
  { key: 'home', label: '首页', icon: '/images/tax-agent/nav/home.png', path: '/pages/tax-agent/index' },
  { key: 'chat', label: '问小税宝', icon: '/images/tax-agent/nav/chat.png', path: '/pages/tax-agent/chat' },
  { key: 'knowledge', label: '卡片', icon: '/images/tax-agent/nav/knowledge.png', path: '/pages/tax-agent/knowledge' },
  { key: 'challenge', label: '闯关', icon: '/images/tax-agent/nav/challenge.png', path: '/pages/tax-agent/challenge' }
];

Component({
  properties: { current: { type: String, value: '' } },
  data: { items: TAB_ITEMS },
  methods: {
    switchPage(event) {
      const { key, path } = event.currentTarget.dataset;
      if (!path || key === this.properties.current) return;
      // 首页进入功能页时保留首页；功能页间切换则替换当前页，避免堆积导航栈。
      const navigate = this.properties.current === 'home'
        ? wx.navigateTo
        : wx.redirectTo;
      navigate({ url: path });
    }
  }
});
