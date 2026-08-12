# 前端迁移状态核查 · 已完成 vs 待做（2026-08-11 更新）

> 编制：陈劲
> 背景：已将本地改动 commit + push（e9a2f7e），发现远端领先 6 个提交（杨伟宏侧「真实微信登录 + Bearer 认证 + 统一请求工具 + 财税智能体集成」），已 rebase 合并。本清单基于最新 origin/master 源码实际状态。

---

## 一、核查结论（先看这句）

**杨伟宏侧已经完成的是「智能体身份联调」相关的统一请求与 Bearer 认证，而业务接口（课程/预约/儿童/通知）的 Spring Boot 迁移基本还没开始。**

具体证据：
- `utils/request.js`、`services/wechat-auth.js` 已存在（基础请求封装 + 登录/智能体 token 管理）。
- 但**全项目里只有 `services/agent-api.js`（财税智能体）在用 `Authorization: Bearer`**，且用的是"智能体 token"，不是登录 token。
- 所有业务页面（`index`、`course-detail`、`notice`、`tweet-detail`、`login-2`）**仍然在用旧的 `wx.request` + `X-WX-OPENID` 头**，完全没有接入新的 `utils/request`，也没有注入登录 `token`。
- `wechat-auth.js` 里虽然有 `redirectToLoginAfterAuthenticationFailure()`（401 跳登录），但**没有任何业务接口调用它**。

一句话：**基础设施有了，业务接入还没动。**

---

## 二、已完成（无需重复劳动）

### 杨伟宏侧已落地
| 项 | 文件 | 说明 |
|---|---|---|
| 统一请求基础封装 | `utils/request.js` | URL 拼接 + HTTP 状态判断（但**未自动注入 token**） |
| 登录与智能体 token 管理 | `services/wechat-auth.js` | `loginWithWechat`、`parseLoginPayload`、`clearAuthentication`、`redirectToLoginAfterAuthenticationFailure` |
| 真实微信登录开关 | `utils/config.js` | `wechatLoginMode: 'wechat'`、`CURRENT_ENV: 'production'` |
| 登录页改造 | `pages/login/login.js` | 改用 `loginWithWechat`，真实微信登录 |
| 智能体接口 + Bearer | `services/agent-api.js` | 仅智能体用 Bearer（agent token） |
| 财税智能体集成 | `pages/tax-agent/*`、`services/agent-api.js` | 智能体体验已接 |

### 陈劲侧已落地（本次 e9a2f7e）
| 项 | 文件 |
|---|---|
| 老师考勤云函数 + 页面 | `cloudfunctions/attendance`、`pages/attendance-admin` |
| 推文点赞评论云函数 | `cloudfunctions/tweet-interaction` |
| 推文 rich-text 正文 | `pages/tweet-detail/*` |
| 课程时间/介绍折叠、我的预约接考勤 | 对应页面 |
| 对接/迁移文档 | `docs/*.md` |

---

## 三、待做（业务接口迁移，基本都未开始）

### 优先级 P0（阻塞点，必须先对齐）
| # | 任务 | 现状 | 阻塞 |
|---|---|---|---|
| P0-1 | **确认登录返回结构** | `parseLoginPayload` 期望 `data.openid`、`data.agent_access_token`、`data.token` | 需杨伟宏确认 `/api/wechat/login` 实际返回字段 |
| P0-2 | **确认业务接口鉴权方式** | 业务页面仍发 `X-WX-OPENID`；`request` 不自动带 token | 需确认后端要不要登录 token 的 Bearer，还是继续用 X-WX-OPENID |
| P0-3 | **确认后端预约/儿童接口是否可用** | 前端仍 `USE_CLOUD_RESERVATION=true` / `USE_CLOUD_CHILDREN=true` | 需杨伟宏确认接口已稳定 |

### 优先级 P1（统一基建增强，先做）
| # | 任务 | 涉及文件 |
|---|---|---|
| P1-1 | 增强 `utils/request`，自动注入 `Authorization: Bearer <登录token>`（或 X-WX-OPENID 兼容） | `utils/request.js` |
| P1-2 | 统一错误码处理：401 调 `redirectToLoginAfterAuthenticationFailure`、400/409/500 Toast | `utils/request.js` |
| P1-3 | 业务页面把 `wx.request` 替换为 `require('../../utils/request')` 的 `request()` | `index`、`course-detail`、`notice`、`tweet-detail`、`login-2` 等 |

### 优先级 P2（业务模块切 Spring Boot）
| # | 任务 | 涉及文件 |
|---|---|---|
| P2-1 | 预约模块关闭 `USE_CLOUD_RESERVATION`，改调 `/api/reservations` | `course-detail`、`index`、`my-reservations` |
| P2-2 | `course-reservations` 管理页：课程从 `/api/courses` 取、名单从 `/api/reservations?courseId=` 取 | `course-reservations.js` |
| P2-3 | 儿童模块关闭 `USE_CLOUD_CHILDREN`，改调 `/api/child/*` | `bindchild`、`course-detail` |
| P2-4 | 课程/推文/通知字段收口（`startDate/startTime/endTime`、`content` 等） | 相关页面 |

### 优先级 P3（清理）
| # | 任务 | 涉及文件 |
|---|---|---|
| P3-1 | 清理 500/fail 时 fallback Mock 假装成功 | `notice.js`、`index.js`、`tweet-detail.js` |
| P3-2 | `DEBUG_*` 开关语义统一（仅开发自测用） | 全页面 |

---

## 四、对原迁移计划（frontend-springboot-migration-plan.md）的修正

| 原计划项 | 修正后 |
|---|---|
| 4.1.1 封装统一 request 拦截器 | 基础版 `utils/request.js` 已存在，**改为增强**：注入 token + 统一错误码 |
| 4.1.2 登录返回解析改造 | 杨伟宏已写 `parseLoginPayload`，**改为核对字段契约**（见 P0-1） |
| 4.1.3 替换所有 wx.request | 仍需做，业务页面全部未接 `utils/request` |
| 4.1.4 鉴权头切换 | 需确认后端要求，若用 Bearer 则在 P1-1 注入 |
| 后端前置接口清单 | 不变，仍需杨伟宏补齐 |

---

## 五、下一步建议

1. **陈劲**先把本核查清单发杨伟宏，重点对齐 **P0-1 / P0-2 / P0-3** 三个阻塞点。
2. 确认登录返回字段与业务接口鉴权方式后，陈劲从 **P1（增强 request + 替换 wx.request）** 开始，这部分不依赖后端数据，可先动手。
3. P2 各模块切换**严格依赖对应后端接口稳定**，逐个接口联调后再关闭对应开关，避免一刀切。

---

## 六、重要提醒

- 当前业务页面若直接切 Bearer，会因为 `request` 不自动带 token 而全部 401。所以 P1-1 必须先做。
- 智能体的 Bearer（agent token）和业务的 Bearer（登录 token）是两套，不要混淆。
- `agentUseMock` 在 `config.js` 已被杨伟宏改为 `false`（真实后端），与陈劲之前本地 `true` 不同——这是预期，因 rebase 后保留的是杨伟宏版本。
