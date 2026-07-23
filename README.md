# 智慧托育小程序：本地开发说明

## 项目结构与实际后端

- 根目录为微信原生小程序：`app.js`、`app.json`、`pages/`、`utils/`。
- `child2/` 是 Spring Boot + MySQL 独立后端，默认端口为 `8080`。
- 小程序保留了 `wx.cloud.init`，但仓库没有 `cloudfunctions/`，也没有 `wx.cloud.callFunction` 或 `wx.cloud.database` 调用；课程、预约、登录等业务当前仍请求独立后端。

## 小程序接口配置

唯一的小程序接口配置位于 `utils/config.js`：开发者工具默认使用 `http://127.0.0.1:8080`。

- `127.0.0.1` 仅适用于微信开发者工具与后端运行在同一台电脑的情况。
- 真机调试时，把 `utils/config.js` 中开发环境地址改为后端电脑当前的局域网 IPv4，并确认防火墙允许访问 8080。
- 生产环境必须填写 HTTPS 域名，并在微信公众平台配置为 request 合法域名；不要在源码中填入未经配置的正式域名。
- 本地调试可在微信开发者工具的「详情 → 本地设置」临时勾选「不校验合法域名、web-view、TLS 版本以及 HTTPS 证书」。该设置只适用于本地开发，不能替代正式环境配置。

## 财税学习智能体本地联调

财税学习模块与课程后端独立，配置同样位于 `utils/config.js`：

- `agentUseMock: false` 时请求本机 FastAPI `http://127.0.0.1:8000`，并固定携带 `X-Agent-App: childcare_miniprogram`。
- 首次进入模块会从 `/api/v1/client/bootstrap` 获取开发测试身份并保存到小程序本地存储；本阶段不使用微信正式登录。
- 将 `agentUseMock` 改回 `true` 可立即切回本地模拟数据，无需启动 FastAPI、Spring Boot 或 MySQL。

启动财税智能体后端前，先确认其 PostgreSQL 已运行；在 `D:\tax-learning-agent\backend` 中执行：

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

然后访问 `http://127.0.0.1:8000/health`，预期得到 `{"status":"ok"}`。此地址仅适用于开发者工具本机联调；真机与正式发布必须使用可访问的 HTTPS 地址并配置合法域名。

## 后端启动前提

后端使用 Java 11、Maven 与 MySQL。先创建 `childdb` 数据库，再按 `child2/.env.example` 在 IDE、终端或部署平台设置环境变量；不要把真实微信凭据或数据库密码提交到 Git。

```powershell
cd child2
mvn test
mvn spring-boot:run
```

成功后检查：

```text
GET http://127.0.0.1:8080/api/tweets
GET http://127.0.0.1:8080/api/courses
GET http://127.0.0.1:8080/api/reservations
```

若返回 502、连接失败或接口不可用，小程序首页与课表会显示示例数据并输出清晰的控制台警告；登录、绑定儿童和预约不会伪造成功结果。

## 微信开发者工具验证

1. 导入仓库根目录，而不是 `child2/`。
2. 后端关闭时，编译后打开首页和课表，确认示例轮播、课程与排期可见，控制台显示 API 降级警告。
3. 启动后端后重新编译，确认首页请求 `/api/tweets`、`/api/courses`，课表请求 `/api/courses`、`/api/reservations` 均返回真实数据。
4. 打开登录、课程详情和绑定儿童页面，确认请求失败只展示错误提示，不会使页面崩溃或显示伪造的登录、绑定、预约成功状态。

## 安全提醒

历史提交中曾出现敏感配置；本次已改为环境变量读取，但不会改写 Git 历史。仓库所有者应尽快轮换既有微信凭据与数据库密码。
