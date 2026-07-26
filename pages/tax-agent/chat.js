const agentApi = require('../../services/agent-api');

function sanitizeDisplayText(value) {
  const lines = String(value || '').replace(/\r\n?/g, '\n').split('\n');
  const sourceStart = lines.findIndex((line) => /^(参考资料|资料来源|相关资料)\s*[:：]?\s*$/i.test(line.trim()));
  // 对话只展示儿童可读的回答正文；来源数据仍由后端保存，不在聊天气泡中显示。
  return lines.slice(0, sourceStart === -1 ? lines.length : sourceStart).join('\n')
    .replace(/([。！？!?])\s*>\s*/g, '$1\n> ')
    .replace(/\s*\[S\d+\]\s*/gi, ' ')
    .trim();
}

function parseInlineSegments(text) {
  const segments = [];
  const source = String(text || '');
  const pattern = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  let match = pattern.exec(source);

  while (match) {
    if (match.index > cursor) {
      segments.push({ text: source.slice(cursor, match.index), strong: false });
    }
    segments.push({ text: match[1], strong: true });
    cursor = match.index + match[0].length;
    match = pattern.exec(source);
  }

  if (cursor < source.length || !segments.length) {
    segments.push({ text: source.slice(cursor), strong: false });
  }
  return segments.filter((segment) => segment.text);
}

function parseLearningBlocks(value) {
  const text = sanitizeDisplayText(value);
  if (!text) {
    return [{ type: 'paragraph', segments: [{ text: '小税暂时没有收到回答，请换个问法试试。', strong: false }] }];
  }

  const blocks = [];
  let paragraphLines = [];
  let listItems = [];
  let quoteLines = [];
  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push({ type: 'paragraph', segments: parseInlineSegments(paragraphLines.join('\n')) });
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', items: listItems.map((line) => ({ segments: parseInlineSegments(line) })) });
      listItems = [];
    };
  };
  const flushQuote = () => {
    if (quoteLines.length) {
      blocks.push({ type: 'quote', segments: parseInlineSegments(quoteLines.join('\n')) });
      quoteLines = [];
    }
  };

  text.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushQuote();
    } else if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      flushQuote();
      listItems.push(line.replace(/^[-*]\s+/, ''));
    } else if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      quoteLines.push(line.replace(/^>\s?/, ''));
    } else {
      flushList();
      flushQuote();
      paragraphLines.push(line);
    }
  });
  flushParagraph();
  flushList();
  flushQuote();
  return blocks;
}

function createMessage(id, role, content) {
  const message = { id, role, content: sanitizeDisplayText(content) };
  if (role === 'agent') {
    message.blocks = parseLearningBlocks(content);
  }
  return message;
}

function createWelcomeMessage() {
  return createMessage(
    'welcome',
    'agent',
    '你好！我是小税。你可以问我税收、发票、公共设施或零花钱的小问题。'
  );
}

Page({
  data: {
    messages: [createWelcomeMessage()],
    recommendedQuestions: [],
    inputMessage: '',
    isLoading: false,
    scrollTo: 'chat-bottom',
    sessionId: '',
    lastFailedMessage: '',
    requestError: ''
  },

  onLoad(options) {
    agentApi.getAgentHome().then((data) => {
      this.setData({ recommendedQuestions: data.recommendedQuestions || [] });
    }).catch((error) => console.warn('[财税学习] 推荐问题加载失败', error));

    if (options.question) {
      this.sendMessage(decodeURIComponent(options.question));
    }
  },

  onInput(event) {
    this.setData({ inputMessage: event.detail.value });
  },

  askRecommendedQuestion(event) {
    this.sendMessage(event.currentTarget.dataset.question);
  },

  sendFromInput() {
    this.sendMessage(this.data.inputMessage);
  },

  sendMessage(rawMessage, isRetry = false) {
    const message = (rawMessage || '').trim();
    if (!message || this.data.isLoading) {
      return;
    }

    const userMessage = createMessage(`user-${Date.now()}`, 'user', message);
    this.setData({
      messages: isRetry ? this.data.messages : this.data.messages.concat(userMessage),
      inputMessage: '',
      isLoading: true,
      scrollTo: 'chat-bottom',
      requestError: ''
    });

    agentApi.sendChat({ message, sessionId: this.data.sessionId })
      .then((data) => {
        const agentMessage = createMessage(
          `agent-${Date.now()}`,
          'agent',
          data.answer
        );
        this.setData({
          messages: this.data.messages.concat(agentMessage),
          isLoading: false,
          scrollTo: 'chat-bottom',
          sessionId: data.session_id,
          lastFailedMessage: '',
          requestError: ''
        });
      })
      .catch((error) => {
        console.warn('[财税学习] 对话请求失败', error);
        this.setData({
          isLoading: false,
          lastFailedMessage: message,
          requestError: error.message || '小税暂时没有收到回答，请稍后再试。'
        });
      });
  },

  retryLastMessage() {
    if (this.data.lastFailedMessage && !this.data.isLoading) {
      this.sendMessage(this.data.lastFailedMessage, true);
    }
  },

  clearConversation() {
    this.setData({
      messages: [createWelcomeMessage()],
      inputMessage: '',
      isLoading: false,
      scrollTo: 'chat-bottom',
      sessionId: '',
      lastFailedMessage: '',
      requestError: ''
    });
  }
});
