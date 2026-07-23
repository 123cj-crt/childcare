# 小程序图片与接口排查

## 本地资源

- 课程表使用 `/icon/book.png`；仓库中不存在 `/icon/course-book.png`。
- 首页轮播降级图片使用 `/images/1.jpg`、`/images/2.jpg`、`/images/3.jpg`。
- tabBar 图标均位于 `/icon/`。

## 后端图片

首页仅会对后端返回的相对图片路径拼接 `utils/config.js` 中的 `API_BASE_URL`。完整的 HTTP(S) 地址保持不变；加载失败时图片会回退为 `/images/1.jpg`。

本地开发者工具可使用 `127.0.0.1:8080`，真机不能使用该地址。真机应改用后端电脑的局域网地址；生产环境必须使用已登记的 HTTPS 域名。

接口请求统一通过 `utils/request.js`，不要在页面中直接调用 `wx.request` 或写死后端地址。
