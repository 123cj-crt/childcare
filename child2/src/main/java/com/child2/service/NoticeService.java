package com.child2.service;

import com.child2.entity.Notice;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 通知服务接口
 */
public interface NoticeService {
    
    /**
     * 获取所有通知
     */
    List<Notice> getAllNotices();
    
    /**
     * 根据ID获取通知
     */
    Optional<Notice> getNoticeById(Long id);
    
    /**
     * 创建通知
     */
    Notice createNotice(Notice notice);
    
    /**
     * 更新通知
     */
    Notice updateNotice(Long id, Notice noticeDetails);
    
    /**
     * 删除通知
     */
    void deleteNotice(Long id);
    
    /**
     * 根据接收对象类型查询通知
     */
    List<Notice> getNoticesByRecipientType(String recipientType);
    
    /**
     * 根据通知类型查询通知
     */
    List<Notice> getNoticesByType(String type);
    
    /**
     * 根据接收对象ID查询通知
     */
    List<Notice> getNoticesByRecipientId(String recipientId);
    
    /**
     * 根据家长OpenID查询个别沟通通知
     */
    List<Notice> getNoticesByParentOpenIdAndType(String parentOpenId, String type);
    
    /**
     * 根据时间范围查询通知
     */
    List<Notice> getNoticesByTimeRange(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取公告通知
     */
    List<Notice> getAnnouncementNotices();
    
    /**
     * 获取提醒事项
     */
    List<Notice> getReminderNotices();
    
    /**
     * 根据班级ID获取班级通知
     */
    List<Notice> getNoticesByClassId(String classId);
    
    /**
     * 根据学生ID获取个别沟通通知
     */
    List<Notice> getNoticesByStudentId(String studentId);
    
    /**
     * 获取最新通知
     */
    List<Notice> getLatestNotices();
    
    /**
     * 获取未读通知
     */
    List<Notice> getUnreadNoticesByParentOpenId(String parentOpenId);
    
    /**
     * 标记通知为已读
     */
    Notice markAsRead(Long noticeId);
    
    /**
     * 批量创建通知
     */
    List<Notice> createBatchNotices(List<Notice> notices);
}
