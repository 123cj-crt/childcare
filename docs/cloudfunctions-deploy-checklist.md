# 微信云函数部署清单（不依赖后端 Spring Boot）

> 用途：把 4 个云函数 + 5 个云数据库集合部署上线，让「预约 / 多家长儿童信息 / 考勤 / 推文点赞评论」在小程序里真正可用。
> 这些都在**微信云开发**侧运行，**与杨伟宏的后端部署互不干扰**，可现在就做。

云环境：`cloud1-2gxcddy05981d85a`（已在 `app.js` 里 `wx.cloud.init` 设置，无需改）

---

## 第一步：在云开发控制台建 5 个集合

1. 打开**微信开发者工具**，进入本项目
2. 点顶部 **「云开发」** 按钮 → 打开云开发控制台
3. 左侧选 **「数据库」**
4. 点 **「+ 新建集合」**，依次创建以下 5 个集合（名字必须完全一致，区分大小写）：

| 集合名 | 用途 |
|--------|------|
| `reservations` | 课程预约记录（reservation 函数用） |
| `children` | 儿童信息（children 函数用） |
| `attendance` | 考勤记录（attendance 函数用） |
| `tweet_likes` | 推文点赞（tweet-interaction 函数用） |
| `tweet_comments` | 推文评论（tweet-interaction 函数用） |

5. **每个集合建好后，点进去 → 「权限设置」→ 选「所有用户可读，仅创建者可写」→ 保存。**
   - 说明：所有读写都经由云函数（云函数有管理员权限，不受此权限限制），这里设权限只是为了兜底，按上面选即可。

> 第 5 步若想更严格（儿童/考勤含他人数据），也可选「仅创建者可读写」，功能不受影响，因为页面都走云函数。新手建议先用「所有用户可读，仅创建者可写」。

---

## 第二步：逐个上传 4 个云函数

在微信开发者工具的**项目文件树**里，找到 `cloudfunctions/` 目录，里面有 4 个子目录：
`attendance` / `children` / `reservation` / `tweet-interaction`

对**每一个**目录，执行：

1. **右键**该目录 → 选 **「上传并部署：云端安装依赖」**
   - ⚠️ 一定要选带「**云端安装依赖**」的那一项（不是"上传并部署：所有文件"），这样云端会按 `package.json` 安装 `wx-server-sdk`。
2. 等待上传 + 安装完成（右下角有进度，几秒到一两分钟；首次装依赖稍慢）。
3. 提示「上传成功」即可。

> 四个目录都要做一遍，别漏。四个 `package.json` 里都声明了 `wx-server-sdk ~2.6.3`，云端会自动装好。

---

## 第三步：验证是否上线

### 快速验证（推荐）
1. 在开发者工具里**编译运行**小程序（或用手机预览）。
2. 进首页 → 点任意课程 → 点 **「预约」**：
   - 成功 → `reservation` 函数 OK，且 `reservations` 集合可写。
3. 进任意**推文详情** → 点 **「点赞」**：
   - 图标变红/计数 +1 → `tweet-interaction` 函数 OK，`tweet_likes` 集合可写。
   - 点「评论」发一条 → 能显示 → `tweet_comments` 集合可写。
4. **老师考勤**（需老师入口）：在 `attendance-admin` 页输入口令 `teacher2026` → 能标记考勤 → `attendance` 函数 + 集合 OK。
5. **儿童信息**：在对应页面「添加儿童」→ `children` 函数 + 集合 OK。

### 更严谨的验证（可选）
云开发控制台 → 左侧 **「云函数」** → 点某个函数 → **「测试」** → 传入对应 action 的 JSON 看返回。
各函数支持的 action：
- `reservation`：`count` / `courseList` / `batchCount` / `myList` / `myAll` / `reserve` / `cancel` / `cancelAll`
- `children`：`list` / `add` / `update` / `remove`
- `attendance`：`verify` / `mark` / `listByCourse` / `listByChild`
- `tweet-interaction`：`getStatus` / `like` / `addComment` / `listComments`

---

## 常见问题

**Q：上传时提示 "wx-server-sdk 找不到 / 函数报错"**
→ 确认第二步选的是「云端安装依赖」那一项；若选错，删掉云函数重新上传即可。

**Q：点赞/预约报错 "collection not exists" 或 "权限不足"**
→ 第一步的集合没建或名字拼错；回到云开发控制台核对 5 个集合名是否完全一致（含大小写）。

**Q：老师考勤输入口令后提示错误**
→ 当前口令是 `teacher2026`（写在 `cloudfunctions/attendance/index.js` 的 `TEACHER_PASSWORD`）。如要改，改源码后重新上传该函数。

**Q：前端之前是不是还走本地/体验版 mock？**
→ 体验版（8 月发的）里 `config.js` 把登录和智能体设成了 mock。云函数这部分（预约/考勤/点赞）不受那个开关影响，按本清单部署后即可真实生效。联调完成后记得把 `config.js` 的体验开关切回生产。

---

## 一句话总览
建 5 个集合（权限：所有用户可读/仅创建者可写）→ 4 个云函数逐个「右键 → 上传并部署：云端安装依赖」→ 编译小程序实测预约/点赞/考勤。整个过程不需要杨伟宏的后端，也不影响他正在做的 Spring Boot 部署。
