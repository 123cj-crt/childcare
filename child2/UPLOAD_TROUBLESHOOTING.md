# 图片上传问题排查指南

## 问题现象
图片上传失败，显示错误：`Error: 上传失败`

## 排查步骤

### 1. 检查后端服务状态
首先测试上传服务是否正常运行：

1. 打开浏览器开发者工具（F12）
2. 在控制台中访问：`http://localhost:8080/api/upload/test`
3. 或者在管理页面点击"测试上传服务"按钮

**正常响应示例：**
```json
{
  "success": true,
  "message": "文件上传服务正常",
  "uploadDir": "uploads/images/",
  "dirExists": true,
  "dirWritable": true,
  "maxFileSize": 5242880,
  "allowedTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"]
}
```

### 2. 检查上传目录权限
确保应用有权限在项目根目录创建 `uploads/images/` 文件夹：

```bash
# 在项目根目录执行
mkdir -p uploads/images
chmod 755 uploads/images
```

### 3. 检查Spring Boot配置
确保 `application.properties` 中有正确的文件上传配置：

```properties
# 文件上传配置
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

### 4. 检查网络请求
在浏览器开发者工具的Network标签中查看：

1. 请求是否发送到正确的URL：`/api/upload/image`
2. 请求方法是否为 `POST`
3. 请求头是否包含 `Content-Type: multipart/form-data`
4. 响应状态码和错误信息

### 5. 检查后端日志
查看Spring Boot控制台输出，查找以下日志：

```
INFO  - 收到图片上传请求，文件名: xxx, 大小: xxx bytes, 类型: xxx
INFO  - 创建上传目录: uploads/images/, 结果: true
INFO  - 生成文件名: xxx
INFO  - 图片上传成功: xxx, URL: xxx, 实际大小: xxx bytes
```

如果看到错误日志，根据具体错误信息进行排查。

### 6. 常见问题及解决方案

#### 问题1：目录权限不足
**错误信息：** `Permission denied`
**解决方案：**
```bash
chmod 755 uploads
chmod 755 uploads/images
```

#### 问题2：文件大小超限
**错误信息：** `文件大小不能超过5MB`
**解决方案：** 选择小于5MB的图片文件

#### 问题3：文件类型不支持
**错误信息：** `不支持的文件类型`
**解决方案：** 确保上传的是 JPG、PNG、GIF 或 WebP 格式

#### 问题4：Spring Boot配置问题
**错误信息：** `MultipartFile is null`
**解决方案：** 检查 `application.properties` 配置

#### 问题5：CORS问题
**错误信息：** `CORS policy`
**解决方案：** 确保 `@CrossOrigin(origins = "*")` 注解存在

### 7. 手动测试API
使用curl命令测试上传API：

```bash
curl -X POST \
  http://localhost:8080/api/upload/image \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/your/image.jpg'
```

### 8. 检查文件系统
确保文件系统有足够空间：

```bash
df -h
```

### 9. 重启应用
如果以上步骤都正常，尝试重启Spring Boot应用：

```bash
# 停止应用
Ctrl+C

# 重新启动
mvn spring-boot:run
```

### 10. 查看完整错误日志
在浏览器控制台中查看完整的错误堆栈：

```javascript
// 在控制台执行
fetch('/api/upload/test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 调试技巧

1. **启用详细日志：** 在 `application.properties` 中添加：
   ```properties
   logging.level.com.child2.controller.FileUploadController=DEBUG
   ```

2. **检查文件路径：** 确保上传目录路径正确，相对路径基于项目根目录

3. **验证文件内容：** 确保选择的文件确实是有效的图片文件

4. **网络检查：** 使用浏览器开发者工具检查网络请求和响应

## 联系支持
如果问题仍然存在，请提供以下信息：

1. 完整的错误日志
2. 浏览器控制台截图
3. 网络请求详情
4. 系统环境信息（操作系统、Java版本等）
5. 上传的文件信息（大小、类型、名称）
