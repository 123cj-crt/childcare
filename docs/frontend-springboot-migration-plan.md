# 前端切换 Spring Boot 改造清单与时间估算

> 编制：陈劲（小程序前端）
> 日期：2026-08-11
> 对应后端：杨伟宏（Spring Boot）
> 版本状态：基于当前源码现状整理

---

## 一、对后端反馈的逐条回应与事实确认

### 反馈 1：USE_CLOUD_RESERVATION=false 后走的是本地 Storage，不是 Spring Boot

**确认：属实。**

当前源码中 `USE_CLOUD_RESERVATION` 是一个二值开关：
- `true` → 调微信云函数 `reservation`
- `false` → 直接读写 `wx.setStorageSync('reserved_course_${id}')` 等本地键值

并没有直接走后端 Spring Boot 的 `/api/reservations`。这是历史遗留：后端 `/api/reservations` 之前 POST 500、鉴权不稳定，所以先切到云开发保证可用。

**结论**：要切 Spring Boot，后端必须先补齐并稳定以下接口，前端再改调用方式。

---

### 反馈 2：course-reservations.js 没有切换开关，仍固定调用云函数且课程硬编码

**确认：属实。**

`pages/course-reservations/course-reservations.js` 当前：
- 课程列表 `COURSES` 是前端硬编码数组
- `loadReservations` 直接 `wx.cloud.callFunction({ name: 'reservation', data: { action: 'courseList' } })`
- 没有 `USE_CLOUD_RESERVATION` 判断，也没有 Spring Boot 调用分支

**结论**：该页面需要整体改造，课程数据源切 `/api/courses`，名单数据源切 `/api/reservations` 的管理查询接口。

---

### 反馈 3：儿童关闭云开发后同样主要回到本地 Storage

**确认：属实。**

`pages/bindchild/bindchild.js` 中：
- `USE_CLOUD_CHILDREN = true` 时调云函数 `children`
- `USE_CLOUD_CHILDREN = false` 时走 `saveLocalFallback()`，即 `wx.setStorageSync('children')` 本地存储

同样没有直接走后端 `/api/child/*`。

**结论**：需要后端补齐儿童增删改查接口，前端再关闭 `USE_CLOUD_CHILDREN` 并改走后端。

---

### 反馈 4：当前源码没有 attendance 和 tweet-interaction 云函数

**说明：本地源码已有，但尚未 push 到 origin/master。**

本地仓库实际包含：
- `cloudfunctions/attendance/index.js` + `package.json`
- `cloudfunctions/tweet-interaction/index.js` + `package.json`
- `pages/attendance-admin/`

Git 状态显示这些目录为 `??`（未跟踪），且多个文件处于 `M`（已修改未提交）状态。最新一次 push 是 `53fb3ed`。

**结论**：会先把本次所有改动 commit + push，让后端同事能拿到完整代码。attendance 和 tweet-interaction 属于前端新增的**独立功能**（老师考勤、推文点赞评论），不属于 Spring Boot 切换范围，会保留在云开发侧，本次暂时不迁。

---

### 反馈 5：正式环境不能在 500 时用 Mock 假装业务成功

**确认：存在问题，需要清理。**

当前代码中 `notice.js` 存在如下逻辑：
```js
const finalNotices = notices.length > 0 ? notices : MOCK_ANNOUNCEMENTS
```
即后端返回空或失败时，会直接显示本地 Mock 公告，给用户的感知是"请求成功了"。

`index.js` 在 `/api/tweets` 或 `/api/courses` 失败时，也会 fallback 到 `MOCK_BANNERS` / `MOCK_COURSES`。

**结论**：这是前端的错误处理不规范，必须统一改成：
- 后端 500 / 网络错误 → Toast 提示失败，不显示 Mock 数据
- 后端返回空数组 → 显示"暂无数据"，不兜底 Mock
- Mock 只在 DEBUG 开关显式打开时使用（用于开发自测）

---

### 反馈 6：智能体当前仍为 Mock 模式

**确认：属实。**

`services/agent-api.js` 默认调用 FastAPI（`http://127.0.0.1:8000`），本地没有启动 FastAPI 时由 `agentUseMock: true` 兜底。该部分后续由陈智皓负责，不在本次 Spring Boot 切换范围内。

---

## 二、改造总体原则

1. **后端接口先稳定，前端再切换**：所有开关关闭前，必须确保对应后端接口已按契约实现并经过联调。
2. **保留 DEBUG 与云开发兜底，但线上不自动 Mock**：`DEBUG_*` 开关保持 `false`，失败不自动 fallback 到 Mock。
3. **统一鉴权**：逐步把 `X-WX-OPENID` 替换为 `Authorization: Bearer <token>`，过渡期建议后端同时兼容两种头。
4. **统一错误处理**：封装 request 拦截器，集中处理 401/400/409/500/网络错误。
5. **课程/推文/通知字段收口**：不再多处硬编码课程，统一从 `/api/courses` 取；推文正文从 `/api/tweets/{id}` 或 content 字段取。

---

## 三、后端需先提供的前置接口

| 模块 | 接口 | 方法 | 必须字段 |
|---|---|---|---|
| 登录 | `/api/wechat/login` | POST | 返回 `{ code, msg, data: { token, openId } }`，data 不再内嵌 JSON 字符串 |
| 鉴权 | 全局 | Header | 兼容 `Authorization: Bearer <token>` 与 `X-WX-OPENID`（过渡期） |
| 课程 | `/api/courses` | GET | `id, title, description, targetAge, capacity, startDate, startTime, endTime, location, teacherName, teacherPhone, image` |
| 课程 | `/api/courses/{id}` | GET | 同上 |
| 推文 | `/api/tweets` | GET | `id, title, image, link, content` |
| 公告 | `/api/notices/announcements` | GET | `id, title, content, createTime, isRead, type` |
| 儿童 | `/api/child/list` | GET | `id, name, age, gender, relation, [phone]` |
| 儿童 | `/api/child/add` | POST | 同上 |
| 儿童 | `/api/child/update/{id}` | PUT/PATCH | 同上 |
| 儿童 | `/api/child/delete/{id}` | DELETE | 返回成功即可 |
| 预约 | `/api/reservations` | GET | 我的预约列表 |
| 预约 | `/api/reservations?courseId=` | GET | 某课程所有预约（管理端） |
| 预约 | `/api/reservations` | POST | `courseId, childId, ...` |
| 预约 | `/api/reservations/{id}` | DELETE / POST | 取消预约 |

---

## 四、前端改造详细清单

### 4.1 通用改造（必须先做，其他模块依赖它）

| # | 改造项 | 涉及文件 | 说明 |
|---|---|---|---|
| 4.1.1 | 封装统一请求拦截器 | 新建 `utils/request.js` | 自动拼 token、统一错误码处理、401 跳转登录、500 Toast |
| 4.1.2 | 登录返回解析改造 | `pages/login/login.js` | 解析新结构 `data.token / data.openId`，不再解析内嵌 JSON 字符串 |
| 4.1.3 | 替换所有 wx.request 调用 | 全页面 | 逐步改为 `request.get/post/put/delete` |
| 4.1.4 | 鉴权头切换 | 全页面 | 优先使用 `Authorization: Bearer <token>`；后端兼容期保留 `X-WX-OPENID` 备用 |

### 4.2 预约模块：从云开发切 Spring Boot

| # | 改造项 | 涉及文件 | 说明 |
|---|---|---|---|
| 4.2.1 | 课程详情预约 | `pages/course-detail/course-detail.js` | 关闭 `USE_CLOUD_RESERVATION`，预约 / 取消 / 查人数 / 查我的预约状态均调后端 |
| 4.2.2 | 首页实时人数 | `pages/index/index.js` | 关闭 `USE_CLOUD_RESERVATION`，从后端批量查各课程预约人数 |
| 4.2.3 | 我的预约 | `pages/my-reservations/my-reservations.js` | 关闭 `USE_CLOUD_RESERVATION`，从后端查我的预约 |
| 4.2.4 | 取消预约 | `pages/my-reservations/my-reservations.js` | 调后端 DELETE / POST 取消接口 |
| 4.2.5 | 删除本地预约相关 storage | 相关文件 | 移除 `reserved_course_*`、`cloud_course_counts` 等本地键读写 |
| 4.2.6 | 移除 reservation 云函数调用 | 相关文件 | 删除 `wx.cloud.callFunction({ name: 'reservation' })` |

### 4.3 课程预约名单页（course-reservations）

| # | 改造项 | 涉及文件 | 说明 |
|---|---|---|---|
| 4.3.1 | 课程列表从后端取 | `pages/course-reservations/course-reservations.js` | 删除硬编码 `COURSES`，改为 `GET /api/courses` |
| 4.3.2 | 预约名单从后端取 | 同上 | 改为 `GET /api/reservations?courseId=` |
| 4.3.3 | 切换开关 | 同上 | 增加 `USE_BACKEND_RESERVATION` 开关，便于回滚 |

### 4.4 儿童模块：从云开发切 Spring Boot

| # | 改造项 | 涉及文件 | 说明 |
|---|---|---|---|
| 4.4.1 | 儿童列表 | `pages/bindchild/bindchild.js`、`pages/course-detail/course-detail.js` | 关闭 `USE_CLOUD_CHILDREN`，从后端 `/api/child/list` 取 |
| 4.4.2 | 新增儿童 | `pages/bindchild/bindchild.js` | 调后端 `POST /api/child/add` |
| 4.4.3 | 修改儿童 | 同上 | 调后端 `PUT /api/child/update/{id}` |
| 4.4.4 | 删除儿童 | 同上 | 调后端 `DELETE /api/child/delete/{id}` |
| 4.4.5 | 清理本地兜底 | 同上 | 保留少量本地缓存用于离线展示，但不作为主数据源 |
| 4.4.6 | 移除 children 云函数调用 | 相关文件 | 删除 `wx.cloud.callFunction({ name: 'children' })` |

### 4.5 课程、推文、通知字段收口

| # | 改造项 | 涉及文件 | 说明 |
|---|---|---|---|
| 4.5.1 | 课程字段解析改造 | `pages/index/index.js`、`pages/course-detail/course-detail.js` | 支持 `startDate/startTime/endTime`，兼容旧 `time` 字符串 |
| 4.5.2 | 课程数据统一 | 全课程相关文件 | 删除各文件硬编码 `MOCK_COURSES`，统一从 `/api/courses` 取 |
| 4.5.3 | 推文正文 rich-text 渲染 | `pages/tweet-detail/tweet-detail.js` | 后端返回 `content` 时用 rich-text 渲染；否则降级本地占位 |
| 4.5.4 | 通知详情正文 | `pages/notice-detail/notice-detail.js` | 从后端 `content` 渲染，不再依赖本地 `NOTICE_CONTENTS` |
| 4.5.5 | 轮播推文 | `pages/index/index.js` | 后端返回 `title/image/content` 后直接用于首页与详情页 |

### 4.6 清理 Mock / 500 fallback 假装成功

| # | 改造项 | 涉及文件 | 说明 |
|---|---|---|---|
| 4.6.1 | 公告失败不兜底 Mock | `pages/notice/notice.js`、`pages/notice-list/notice-list.js` | 后端失败 / 空数据时显示"暂无通知"，不再 fallback 到 `MOCK_ANNOUNCEMENTS` |
| 4.6.2 | 课程失败不兜底 Mock | `pages/index/index.js`、`pages/course-detail/course-detail.js` | 后端失败时显示"加载失败"，提供重试按钮 |
| 4.6.3 | 推文失败不兜底 Mock | `pages/index/index.js` | 后端失败时显示"暂无推文" |
| 4.6.4 | DEBUG 开关语义统一 | 全页面 | `DEBUG_*` 仅用于开发自测；线上必须为 `false` |

---

## 五、不纳入本次切换的范围（继续保留）

| 模块 | 说明 |
|---|---|
| `attendance` 云函数与老师考勤页 | 独立功能，Spring Boot 后端暂无对应接口，继续走云开发 |
| `tweet-interaction` 云函数 | 推文点赞/评论，属于互动功能，后端暂无对应接口，继续走云开发 |
| 智能体模块 | 由陈智皓后续对接 FastAPI，不在本次 Spring Boot 切换范围 |

---

## 六、改造排期与依赖关系

### 第一阶段：前置准备（后端先完成，前端可并行）

| 序号 | 任务 | 负责 | 工期 | 依赖 |
|---|---|---|---|---|
| 1 | 后端补齐登录返回结构化 JSON + token | 杨伟宏 | 1 天 | 无 |
| 2 | 后端补齐 `/api/reservations` GET/POST/DELETE | 杨伟宏 | 2-3 天 | 任务 1 |
| 3 | 后端补齐 `/api/child/*` 增删改查 | 杨伟宏 | 2-3 天 | 任务 1 |
| 4 | 后端补齐课程/推文/通知字段契约 | 杨伟宏 | 1-2 天 | 任务 1 |
| 5 | 后端鉴权同时兼容 Bearer Token 与 X-WX-OPENID | 杨伟宏 | 0.5 天 | 任务 1 |
| 6 | 前端封装统一 request 拦截器 | 陈劲 | 0.5-1 天 | 任务 1、5 |

### 第二阶段：前端切换改造

| 序号 | 任务 | 负责 | 工期 | 依赖 |
|---|---|---|---|---|
| 7 | 预约模块切 Spring Boot（4 个文件） | 陈劲 | 1-1.5 天 | 任务 2、6 |
| 8 | course-reservations 管理页改造 | 陈劲 | 0.5 天 | 任务 2、4、6 |
| 9 | 儿童模块切 Spring Boot | 陈劲 | 1-1.5 天 | 任务 3、6 |
| 10 | 课程/推文/通知字段收口 | 陈劲 | 0.5-1 天 | 任务 4、6 |
| 11 | 清理 Mock / 500 假装成功逻辑 | 陈劲 | 0.5 天 | 任务 7、8、9、10 |

### 第三阶段：联调与发布

| 序号 | 任务 | 负责 | 工期 | 依赖 |
|---|---|---|---|---|
| 12 | 前后端联调 | 陈劲 + 杨伟宏 | 1-2 天 | 任务 7-11 |
| 13 | 上传代码、设体验版、回归测试 | 陈劲 | 0.5-1 天 | 任务 12 |
| 14 | 提交线上发布 + 小程序备案跟进 | 陈劲 | 视备案进度 | 任务 13 |

---

## 七、时间估算汇总

### 前端纯改造工作量

| 模块 | 估算 |
|---|---|
| 统一 request 拦截器 + 登录解析 | 0.5-1 天 |
| 预约模块切 Spring Boot | 1-1.5 天 |
| course-reservations 改造 | 0.5 天 |
| 儿童模块切 Spring Boot | 1-1.5 天 |
| 课程/推文/通知字段收口 | 0.5-1 天 |
| 清理 Mock / 500 fallback | 0.5 天 |
| 联调与修复 | 1-2 天 |
| **前端合计** | **约 5-7 个工作日** |

### 后端接口开发工作量（供参考）

| 模块 | 估算 |
|---|---|
| 登录返回改造 + 鉴权兼容 | 0.5-1 天 |
| 预约接口 GET/POST/DELETE | 2-3 天 |
| 儿童接口增删改查 | 2-3 天 |
| 课程/推文/通知字段补齐 | 1-2 天 |
| **后端合计** | **约 6-9 个工作日** |

### 关键路径

**如果前后端并行推进，关键路径约为 7-10 个工作日**（以较慢一端 + 1-2 天联调为准）。

**如果后端接口先全部就绪，前端单独改造 + 联调约需 5-7 个工作日。**

---

## 八、风险点

1. **后端接口不稳定就切，会回退困难** → 必须每个接口先联调通过再关闭对应开关。
2. **500 时前端不兜底 Mock，用户感知会变差** → 需要后端接口稳定上线，否则页面会频繁报错。
3. **登录鉴权一刀切会导致全站登录失败** → 强烈建议后端过渡期同时兼容两种鉴权头。
4. **课程/推文字段变更影响多处页面** → 需统一解析函数，避免各文件各自解析。
5. **云开发中的历史数据迁移** → 当前云数据库里的预约、儿童、考勤、点赞评论数据是否需要同步到后端 MySQL？需要单独讨论。

---

## 九、下一步行动建议

1. 陈劲先把本地 `attendance`、`tweet-interaction`、`attendance-admin` 以及各页面改动 **commit + push 到 origin/master**，避免后端同事再看旧代码。
2. 杨伟宏按"后端前置接口"表格先补齐接口，并提供一份 Postman / 接口文档。
3. 双方先对齐**登录鉴权方式**和**预约/儿童接口字段**，这是阻塞点。
4. 陈劲开始封装 `utils/request.js`，为后续模块切换做准备。
