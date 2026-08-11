const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const pageDir = __dirname;
const wxml = fs.readFileSync(path.join(pageDir, 'chat.wxml'), 'utf8');
const wxss = fs.readFileSync(path.join(pageDir, 'chat.wxss'), 'utf8');

test('聊天区域固定展示 AI 生成内容标识', () => {
  const heroCopyIndex = wxml.indexOf('class="chat-hero-copy"');
  const subtitleIndex = wxml.indexOf('class="chat-subtitle"');
  const disclosureIndex = wxml.indexOf('内容由AI生成，仅用于儿童财税课程学习');
  const messageListIndex = wxml.indexOf('class="message-list"');

  assert.ok(heroCopyIndex >= 0);
  assert.ok(heroCopyIndex < subtitleIndex);
  assert.ok(subtitleIndex < disclosureIndex);
  assert.ok(disclosureIndex >= 0);
  assert.ok(disclosureIndex < messageListIndex);
  assert.match(wxss, /\.ai-disclosure\s*\{[^}]*display:\s*inline-flex/);
  assert.match(wxss, /\.ai-disclosure\s*\{[^}]*background:\s*rgba\(255, 255, 255, \.76\)/);
});
