package com.child2.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    // 上传目录
    private static final String UPLOAD_DIR = "uploads/images/";
    
    // 允许的图片类型
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};
    
    // 最大文件大小 (5MB)
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("image") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        logger.info("收到图片上传请求，文件名: {}, 大小: {} bytes, 类型: {}", 
                   file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        // 确保上传目录存在
        if (!ensureUploadDirectoryExists()) {
            logger.error("无法创建上传目录: {}", UPLOAD_DIR);
            response.put("success", false);
            response.put("message", "无法创建上传目录");
            return ResponseEntity.internalServerError().body(response);
        }
        
        // @RequestParam注解确保file不会为null
        
        try {
            // 验证文件
            if (file.isEmpty()) {
                logger.warn("上传文件为空");
                response.put("success", false);
                response.put("message", "文件不能为空");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 验证文件类型
            if (!isValidImageType(file.getContentType())) {
                logger.warn("不支持的文件类型: {}", file.getContentType());
                response.put("success", false);
                response.put("message", "不支持的文件类型，请上传 JPG、PNG、GIF 或 WebP 格式的图片");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 验证文件大小
            if (file.getSize() > MAX_FILE_SIZE) {
                logger.warn("文件大小超限: {} bytes", file.getSize());
                response.put("success", false);
                response.put("message", "文件大小不能超过5MB");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 目录已在方法开始时确保存在
            
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + extension;
            
            logger.info("生成文件名: {}", filename);
            
            // 保存文件
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.copy(file.getInputStream(), filePath);
            
            // 验证文件是否成功保存
            if (!Files.exists(filePath)) {
                logger.error("文件保存失败: {}", filePath);
                response.put("success", false);
                response.put("message", "文件保存失败");
                return ResponseEntity.internalServerError().body(response);
            }
            
            // 生成访问URL
            String imageUrl = "/uploads/images/" + filename;
            
            response.put("success", true);
            response.put("url", imageUrl);
            response.put("filename", filename);
            response.put("originalName", originalFilename);
            response.put("size", file.getSize());
            
            logger.info("图片上传成功: {}, URL: {}, 实际大小: {} bytes", 
                       filename, imageUrl, Files.size(filePath));
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            logger.error("图片上传IO异常: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "文件上传失败: " + e.getMessage());
            response.put("error", "IO_EXCEPTION");
            return ResponseEntity.internalServerError().body(response);
        } catch (SecurityException e) {
            logger.error("图片上传安全异常: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "文件访问权限不足: " + e.getMessage());
            response.put("error", "SECURITY_EXCEPTION");
            return ResponseEntity.internalServerError().body(response);
        } catch (Exception e) {
            logger.error("图片上传异常: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "上传过程中发生错误: " + e.getMessage());
            response.put("error", "UNKNOWN_EXCEPTION");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 确保上传目录存在
     */
    private boolean ensureUploadDirectoryExists() {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                boolean created = uploadDir.mkdirs();
                logger.info("创建上传目录: {}, 结果: {}", UPLOAD_DIR, created);
                return created;
            }
            return true;
        } catch (Exception e) {
            logger.error("创建上传目录失败: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * 验证是否为有效的图片类型
     */
    private boolean isValidImageType(String contentType) {
        if (contentType == null) {
            return false;
        }
        
        for (String allowedType : ALLOWED_TYPES) {
            if (contentType.equals(allowedType)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return ".jpg"; // 默认扩展名
        }
        return filename.substring(filename.lastIndexOf("."));
    }
    
    /**
     * 简单测试端点
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "FileUploadController is working");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    /**
     * 简化的图片上传测试
     */
    @PostMapping("/simple")
    public ResponseEntity<Map<String, Object>> simpleUpload(@RequestParam("image") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("简单上传测试 - 文件名: {}, 大小: {}", 
                       file.getOriginalFilename(), file.getSize());
            
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "文件为空");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 确保目录存在
            ensureUploadDirectoryExists();
            
            // 生成文件名
            String filename = "test_" + System.currentTimeMillis() + ".jpg";
            String filePath = UPLOAD_DIR + filename;
            
            // 保存文件
            file.transferTo(new File(filePath));
            
            response.put("success", true);
            response.put("message", "上传成功");
            response.put("filename", filename);
            response.put("url", "/uploads/images/" + filename);
            
            logger.info("简单上传成功: {}", filename);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("简单上传失败: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "上传失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 测试上传功能
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testUpload() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 检查上传目录
            File uploadDir = new File(UPLOAD_DIR);
            boolean dirExists = uploadDir.exists();
            boolean dirWritable = uploadDir.canWrite();
            
            // 尝试创建测试文件
            boolean canCreateFile = false;
            try {
                File testFile = new File(uploadDir, "test.tmp");
                canCreateFile = testFile.createNewFile();
                if (canCreateFile) {
                    testFile.delete();
                }
            } catch (Exception e) {
                logger.warn("无法创建测试文件: {}", e.getMessage());
            }
            
            response.put("success", true);
            response.put("message", "文件上传服务正常");
            response.put("uploadDir", UPLOAD_DIR);
            response.put("dirExists", dirExists);
            response.put("dirWritable", dirWritable);
            response.put("canCreateFile", canCreateFile);
            response.put("maxFileSize", MAX_FILE_SIZE);
            response.put("allowedTypes", ALLOWED_TYPES);
            response.put("currentWorkingDir", System.getProperty("user.dir"));
            
            logger.info("上传服务测试 - 目录存在: {}, 可写: {}, 可创建文件: {}", 
                       dirExists, dirWritable, canCreateFile);
            
        } catch (Exception e) {
            logger.error("上传服务测试失败", e);
            response.put("success", false);
            response.put("message", "上传服务测试失败: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 删除图片文件
     */
    @DeleteMapping("/image/{filename}")
    public ResponseEntity<Map<String, Object>> deleteImage(@PathVariable String filename) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                response.put("success", true);
                response.put("message", "文件删除成功");
                System.out.println("图片删除成功: " + filename);
            } else {
                response.put("success", false);
                response.put("message", "文件不存在");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            System.err.println("图片删除失败: " + e.getMessage());
            response.put("success", false);
            response.put("message", "文件删除失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
