package com.child2.controller;

import com.child2.entity.Notice;
import com.child2.service.NoticeService;
import com.child2.util.R;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 通知管理控制器
 */
@RestController
@RequestMapping("/api/notices")
public class NoticeController {
    
    @Autowired
    private NoticeService noticeService;
    
    /**
     * 获取所有通知
     */
    @GetMapping
    public R<List<Notice>> getAllNotices() {
        List<Notice> notices = noticeService.getAllNotices();
        return R.ok(notices);
    }
    
    /**
     * 根据ID获取通知
     */
    @GetMapping("/{id}")
    public ResponseEntity<Notice> getNoticeById(@PathVariable String id) {
        try {
            Long numericId = Long.parseLong(id);
            Optional<Notice> notice = noticeService.getNoticeById(numericId);
            return notice.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 创建通知
     */
    @PostMapping
    public R<Notice> createNotice(@RequestBody Notice notice) {
        try {
            Notice createdNotice = noticeService.createNotice(notice);
            return R.ok(createdNotice);
        } catch (Exception e) {
            return R.error("创建通知失败: " + e.getMessage());
        }
    }
    
    /**
     * 批量创建通知
     */
    @PostMapping("/batch")
    public R<List<Notice>> createBatchNotices(@RequestBody List<Notice> notices) {
        try {
            List<Notice> createdNotices = noticeService.createBatchNotices(notices);
            return R.ok(createdNotices);
        } catch (Exception e) {
            return R.error("批量创建通知失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新通知
     */
    @PutMapping("/{id}")
    public R<Notice> updateNotice(@PathVariable String id, @RequestBody Notice noticeDetails) {
        try {
            Long numericId = Long.parseLong(id);
            Notice updatedNotice = noticeService.updateNotice(numericId, noticeDetails);
            return R.ok(updatedNotice);
        } catch (NumberFormatException e) {
            return R.error("无效的ID格式");
        } catch (Exception e) {
            return R.error("更新通知失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除通知
     */
    @DeleteMapping("/{id}")
    public R<String> deleteNotice(@PathVariable String id) {
        try {
            Long numericId = Long.parseLong(id);
            noticeService.deleteNotice(numericId);
            return R.ok("通知删除成功");
        } catch (NumberFormatException e) {
            return R.error("无效的ID格式");
        } catch (Exception e) {
            return R.error("删除通知失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取公告通知
     */
    @GetMapping("/announcements")
    public R<List<Notice>> getAnnouncementNotices() {
        List<Notice> notices = noticeService.getAnnouncementNotices();
        return R.ok(notices);
    }
    
    /**
     * 获取提醒事项
     */
    @GetMapping("/reminders")
    public R<List<Notice>> getReminderNotices() {
        List<Notice> notices = noticeService.getReminderNotices();
        return R.ok(notices);
    }
    
    /**
     * 根据班级ID获取班级通知
     */
    @GetMapping("/class/{classId}")
    public R<List<Notice>> getNoticesByClassId(@PathVariable String classId) {
        List<Notice> notices = noticeService.getNoticesByClassId(classId);
        return R.ok(notices);
    }
    
    /**
     * 根据学生ID获取个别沟通通知
     */
    @GetMapping("/student/{studentId}")
    public R<List<Notice>> getNoticesByStudentId(@PathVariable String studentId) {
        List<Notice> notices = noticeService.getNoticesByStudentId(studentId);
        return R.ok(notices);
    }
    
    /**
     * 根据家长OpenID获取通知
     */
    @GetMapping("/parent/{parentOpenId}")
    public R<List<Notice>> getNoticesByParentOpenId(@PathVariable String parentOpenId) {
        List<Notice> notices = noticeService.getNoticesByParentOpenIdAndType(parentOpenId, "individual");
        return R.ok(notices);
    }
    
    /**
     * 获取未读通知
     */
    @GetMapping("/unread/{parentOpenId}")
    public R<List<Notice>> getUnreadNotices(@PathVariable String parentOpenId) {
        List<Notice> notices = noticeService.getUnreadNoticesByParentOpenId(parentOpenId);
        return R.ok(notices);
    }
    
    /**
     * 标记通知为已读
     */
    @PutMapping("/{id}/read")
    public R<Notice> markAsRead(@PathVariable String id) {
        try {
            Long numericId = Long.parseLong(id);
            Notice notice = noticeService.markAsRead(numericId);
            return R.ok(notice);
        } catch (NumberFormatException e) {
            return R.error("无效的ID格式");
        } catch (Exception e) {
            return R.error("标记已读失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据时间范围查询通知
     */
    @GetMapping("/time-range")
    public R<List<Notice>> getNoticesByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<Notice> notices = noticeService.getNoticesByTimeRange(startTime, endTime);
        return R.ok(notices);
    }
}
