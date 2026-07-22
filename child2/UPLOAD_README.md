# 图片上传功能说明

## 功能概述
为智慧托育管理平台添加了本地图片上传功能，支持在添加微信公众号推文时上传本地图片。

## 主要特性

### 1. 前端功能
- **双重输入方式**：支持直接输入图片URL或上传本地图片
- **图片预览**：选择本地图片后立即显示预览
- **上传进度**：显示上传进度条和状态
- **文件验证**：客户端验证文件类型和大小
- **用户友好**：直观的拖拽上传界面

### 2. 后端API
- **RESTful接口**：`POST /api/upload/image`
- **文件验证**：服务端验证文件类型、大小
- **安全存储**：使用UUID生成唯一文件名
- **错误处理**：完善的错误处理和响应

### 3. 支持的文件格式
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### 4. 文件大小限制
- 最大文件大小：5MB

## API接口

### 上传图片
```
POST /api/upload/image
Content-Type: multipart/form-data

参数：
- image: 图片文件 (MultipartFile)

响应：
{
  "success": true,
  "url": "/uploads/images/uuid-filename.jpg",
  "filename": "uuid-filename.jpg",
  "originalName": "original-filename.jpg",
  "size": 123456
}
```

### 测试上传服务
```
GET /api/upload/test

响应：
{
  "success": true,
  "message": "文件上传服务正常",
  "uploadDir": "uploads/images/",
  "maxFileSize": 5242880,
  "allowedTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"]
}
```

### 删除图片
```
DELETE /api/upload/image/{filename}

响应：
{
  "success": true,
  "message": "文件删除成功"
}
```

## 文件存储

### 存储位置
- 上传目录：`uploads/images/`
- 访问URL：`/uploads/images/{filename}`

### 文件命名
- 使用UUID生成唯一文件名
- 保留原始文件扩展名
- 避免文件名冲突

## 配置说明

### WebConfig配置
```java
registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:uploads/");
```

### 自动创建目录
- 应用启动时自动创建上传目录
- 确保目录结构完整

## 使用示例

### 前端使用
1. 点击"添加推文"按钮
2. 在图片输入区域选择上传方式：
   - 直接输入图片URL
   - 或点击上传区域选择本地图片
3. 选择图片后显示预览
4. 点击"上传图片"按钮
5. 等待上传完成，URL自动填入输入框
6. 填写推文链接并保存

### 错误处理
- 文件类型不支持：显示错误提示
- 文件过大：显示大小限制提示
- 上传失败：显示具体错误信息
- 网络错误：显示重试提示

## 安全考虑

1. **文件类型验证**：严格验证文件MIME类型
2. **文件大小限制**：防止大文件攻击
3. **唯一文件名**：使用UUID避免文件名冲突
4. **路径安全**：限制上传目录，防止路径遍历
5. **CORS配置**：支持跨域请求

## 扩展功能

### 可扩展的特性
- 图片压缩和优化
- 多尺寸缩略图生成
- 图片水印添加
- 批量上传支持
- 云存储集成（阿里云OSS、腾讯云COS等）

## 注意事项

1. 确保服务器有足够的磁盘空间
2. 定期清理无用的上传文件
3. 考虑使用CDN加速图片访问
4. 生产环境建议使用云存储服务
5. 定期备份重要图片文件
