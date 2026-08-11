# 小程序侧接口对齐 · 陈劲（前端）回答清单

> 用途：前后端接口对齐会议 / 工作群前置材料。
> 涉及项目：托育小程序（前端：陈劲；后端 Spring Boot：杨伟宏）。
> 版本状态：本清单基于 2026-08-11 源码现状整理，后端接口以杨伟宏实际返回为准。

---

## 一、对两张对齐图的快速判断

**图1（问题清单）**

- “先统一说法”是关键：当前问题本质是**线上后端、本地源码、小程序实际调用**三处不一致，不是哪一方全责，先停止互相甩锅。
- 杨伟宏需明确回答的 10 个问题（版本部署、登录接口、鉴权方式、字段命名、管理端权限）必须由后端交代清楚。
- 陈劲需明确回答的 7 个问题，见下方第二节现成答案。

**图2（必须共同确定的结论）**

- 整体方向合理，但部分结论**前端目前尚未落地**，会后需统一改代码，不是开完会就自动生效。
- 详见第三节“对统一结论的补充提醒”。

---

## 二、陈劲侧 7 个问题 · 现成答案

### 1. 小程序目前哪些页面调用 Spring Boot？

| 页面 / 文件 | 调用的后端接口 |
|---|---|
| `pages/login/login.js` | `POST /api/wechat/login` |
| `pages/index/index.js` | `GET /api/tweets`（轮播）、`GET /api/courses`（课程列表） |
| `pages/course-detail/course-detail.js` | `GET /api/courses/{id}`、`GET /api/teachers/{id}`、`GET /api/reservations?courseId=` |
| `pages/notice/notice.js` | `GET /api/notices/announcements`、`GET /api/notices/reminders`、`GET /api/child/list`、`GET /api/notices/student/{id}` |
| `pages/tweet-detail/tweet-detail.js` | `GET /api/tweets`（取单篇 content） |
| `services/agent-api.js` | 调用 FastAPI（智能体，非 Spring Boot，单独处理） |

⚠️ `pages/login-2/login-2.js` 里有 `/api/child/bind`，不确定是否仍在使用，需确认是否废弃。

### 2. 哪些功能使用微信云数据库或 Mock？

**微信云数据库（云函数 + 云集合）**

- 预约：`cloudfunctions/reservation` → 集合 `reservations`
- 儿童：`cloudfunctions/children` → 集合 `children`
- 考勤：`cloudfunctions/attendance` → 集合 `attendance`
- 推文互动：`cloudfunctions/tweet-interaction` → 集合 `tweet_likes`、`tweet_comments`

**Mock 数据（仅作为后端失败兜底，DEBUG 开关当前均为 false）**

- `MOCK_COURSES`（课程数据）
- `MOCK_BANNERS`（轮播推文）
- `MOCK_ANNOUNCEMENTS`（公告通知）

### 3. 预约最终准备写微信云数据库还是 Spring Boot？

**最终写入 Spring Boot 后端数据库**，同意图2结论。

当前因 `/api/reservations` 不稳定（历史 POST 500、鉴权规则反复变动），过渡阶段用云数据库保证小程序可跑；后端接口稳定后，前端将 `USE_CLOUD_RESERVATION` 改为 `false`，统一走后端。

### 4. 当前实际发送的请求头、请求体和字段名称

所有后端请求头当前为：

```js
header: {
  'content-type': 'application/json',
  'X-WX-OPENID': openId || ''
}
```

- 登录返回虽解析并保存了 `token`，但其他接口**尚未改为 `Authorization: Bearer <token>`**，这是必须统一改造的点。
- 预约字段前端已用 `courseId`、`childId`。
- 课程当前本地是 `time` 字符串（如 `"14:45-17:00"`）；若后端改为 `startDate`/`startTime`/`endTime`，前端需同步解析。

### 5. 小程序希望后端返回哪些字段？

| 接口 | 关键字段 |
|---|---|
| `POST /api/wechat/login` | `{ token, openId, [userInfo] }`，结构稳定 JSON，**不要 `data` 内套 JSON 字符串** |
| `GET /api/courses` / `/api/courses/{id}` | `id, title, description, targetAge, capacity, startDate, startTime, endTime, location, teacherName, teacherPhone, image` |
| `GET /api/tweets` | `id, title, image, link, content`（content 为 HTML 富文本，详见 `docs/tweet-api-integration.md`） |
| `GET /api/notices/*` | `id, title, content, createTime, isRead, type` |
| `GET /api/child/list` | `id, name, age, gender, relation, [phone]` |
| `GET/POST /api/reservations` | `courseId, childId, childName, courseName, courseDate, courseTime, status, reservedAt` |

### 6. 后端返回 400 / 401 / 500 时，小程序如何处理？

| 状态码 | 处理 |
|---|---|
| `401` | 跳转登录页，或静默刷新 token 后重试 |
| `400` | Toast 提示“请求参数错误” |
| `409` | 预约冲突/重复，提示“已预约”或“名额已满” |
| `500` | Toast 提示“服务器繁忙，请稍后再试”，并降级到本地 Mock（若该页有兜底） |
| 其他网络错误 | 同样降级 + 记录日志 |

⚠️ 前端需封装统一 request 拦截器处理这些状态码，当前各页面各自处理较零散。

### 7. 切换接口方案后，哪些本地兜底和 Mock 需要关闭？

- 预约：把 `USE_CLOUD_RESERVATION = true` 全部改 `false`（`index.js`、`course-detail.js`、`my-reservations.js`、`course-reservations.js`）
- 儿童：把 `USE_CLOUD_CHILDREN = true` 改 `false`（`bindchild.js`）
- 课程 / 推文 / 通知的 `DEBUG_*` 开关保持 `false` 即可（本就是“后端失败才用 Mock”兜底）
- 登录 `DEBUG_SKIP_LOGIN` 保持 `false`

**前提**：后端对应接口必须先稳定可用，否则一关兜底小程序即崩。

---

## 三、对图2统一结论的补充提醒

以下结论方向没问题，但**前端目前尚未做到**，需会后统一改代码：

1. **`Authorization: Bearer <token>` 鉴权**
   前端当前用 `X-WX-OPENID`。建议后端过渡期同时兼容两种鉴权，前端逐步切 Bearer，避免一刀切导致登录全线崩溃。

2. **预约主数据源切 Spring Boot**
   同意，但必须等 `/api/reservations` GET/POST 都修通、字段对齐后再切。

3. **课程字段改为 `startDate`/`startTime`/`endTime`**
   前端当前 MOCK 为 `time` 字符串。后端按此返回后，课程详情页与列表页需同步改解析逻辑。

4. **登录返回结构化 JSON**
   当前后端实测返回 `{code, msg, data: "{\"openid\":\"...\"}"}`，`data` 是 JSON 字符串。建议改为 `{code, msg, data: {token, openId}}`。

5. **管理端查询预约需管理员权限**
   属后端管理端逻辑，小程序家长端不直接涉及；但前端需知道管理端接口路径与鉴权方式，避免误调。

---

## 四、会议必须现场拍板的 3 件事

1. 鉴权到底用 `X-WX-OPENID` 还是 `Authorization: Bearer <token>`？过渡期如何兼容？
2. `/api/reservations` 何时修通？修通后前端何时切换？
3. 课程字段继续用 `time` 字符串，还是改成 `startDate/startTime/endTime`？

---

## 五、会后交付物（前端侧）

- 按最终结论统一改前端：关闭云数据库/Mock 兜底、补统一错误处理。
- 推文正文对接文档见 `docs/tweet-api-integration.md`（后端加 `title` + `content` 字段即生效）。
