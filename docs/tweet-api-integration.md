# 托育小程序 · 推文接口对接说明（后端 → 小程序）

> 用途：转发给后端同事，说明「推文接口」需要补充哪些字段，才能让小程序**直接显示完整真实正文**，而不是只给一个微信文章链接。

---

## 1. 背景

小程序推文详情页现在需要**直接展示后端推送的文章正文**。

为什么不能只给微信链接：微信文章链接（`mp.weixin.qq.com`）受小程序 `web-view` 业务域名限制，小程序内无法内嵌打开，只能让用户复制链接去微信看。

**解决方案**：后端在推文列表接口里返回文章正文（HTML 富文本），小程序用 `rich-text` 组件渲染，即可在小程序内显示完整真实的排版正文。

---

## 2. 涉及接口

```
GET /api/tweets
```

### 当前返回（实测）

```json
[
  {
    "image": "https://picsum.photos/400/200?random=1",
    "link": "https://mp.weixin.qq.com/s/example1",
    "id": 1
  },
  {
    "image": "https://picsum.photos/400/200?random=2",
    "link": "https://mp.weixin.qq.com/s/example2",
    "id": 2
  }
]
```

问题：只有 `image` / `link` / `id`，**缺 `title`，完全没有正文 `content`**。

---

## 3. 需要后端补充的字段

每篇推文对象请补充以下字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | number | 是 | 推文唯一 ID |
| `title` | string | 建议必填 | 推文标题，显示在首页轮播与详情页顶部（不填会显示成"推文 1"） |
| `image` | string | 是 | 封面图 URL，需为**小程序合法域名下的 HTTPS 图片**（否则真机不显示） |
| `link` | string | 否 | 原文外链，可选。有正文后建议保留，作为"查看原文"备用入口 |
| `content` | string | **是（核心）** | **文章正文 HTML 富文本**，小程序用 `rich-text` 渲染 |

---

## 4. `content` 字段规范（非常重要）

`content` 是一段 HTML 字符串，小程序 `rich-text` 会原样渲染。请遵守以下规范：

1. **图片必须是 HTTPS**，且所在域名需配置为小程序后台「downloadFile 合法域名」。
2. **每张 `<img>` 必须带行内样式控制宽度**，否则图片会撑破屏幕：
   ```html
   <img src="https://gdufe-childcare.cn/uploads/xxx.jpg" style="max-width:100%;height:auto;" />
   ```
3. 推荐使用语义标签：`<h3>`、`<p>`、`<br>`、`<strong>`、`<ul>/<li>` 等。
4. **禁止**：`<script>`、`<iframe>`、外链 `<link>` 样式表、整段套固定宽度外层容器（如 `<div style="width:600px">`，会导致手机端横向滚动）。

### 推荐 content 示例

```html
<h3>智慧托育中心正式开园</h3>
<p>我们秉持"养教合一"的理念，让孩子在游戏与探索中自然成长。</p>
<img src="https://gdufe-childcare.cn/uploads/example.jpg" style="max-width:100%;height:auto;" />
<p>中心配备专业育婴师与早教师团队，欢迎预约到园参观。</p>
```

---

## 5. 前端行为（供联调参考，无需后端关心实现）

- 首页轮播：读 `image` / `title` / `link`；
- 详情页：优先渲染 `content`（rich-text）；若 `content` 为空，则降级显示本地占位文案，并在有 `link` 时显示"复制原文链接"按钮；
- 点赞 / 评论走独立云函数，与正文接口无关。

---

## 6. 联调验证步骤

1. 后端在 `GET /api/tweets` 返回带 `title` + `content`（按上面示例格式）的数据；
2. 小程序上传代码并重新发布**体验版**；
3. 体验成员扫码 → 首页轮播点进推文 → 应看到完整排版的真实正文；
4. 检查图片是否完整显示、页面有无横向滚动（如有，通常是 content 里 img 缺 `max-width` 或外层有固定宽度容器）。

---

## 7. 注意事项

- `image` 和正文图片的域名需加入小程序后台「downloadFile 合法域名」白名单；
- 当前后端域名 `gdufe-childcare.cn` 已备案且已配置 HTTPS，可直接用于图片托管；
- 若正文来自微信公众号文章，请勿直接把公众号网页 HTML 塞进 `content`（含大量微信私有样式/防盗链，渲染会异常）。建议后端用富文本编辑器（如后台 CMS）单独维护一份干净的正文。
