package com.child2.repository;

import com.child2.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 通知数据访问层
 */
@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    /**
     * 根据接收对象类型查询通知
     */
    List<Notice> findByRecipientType(String recipientType);
    
    /**
     * 根据通知类型查询通知
     */
    List<Notice> findByType(String type);
    
    /**
     * 根据接收对象ID查询通知
     */
    List<Notice> findByRecipientId(String recipientId);
    
    /**
     * 根据家长OpenID查询个别沟通通知
     */
    List<Notice> findByParentOpenIdAndType(String parentOpenId, String type);
    
    /**
     * 根据时间范围查询通知
     */
    List<Notice> findBySendTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 查询公告通知（所有家长）
     */
    @Query("SELECT n FROM Notice n WHERE n.recipientType = 'all' AND n.type = 'announcement' ORDER BY n.sendTime DESC")
    List<Notice> findAnnouncementNotices();
    
    /**
     * 查询提醒事项（所有家长）
     */
    @Query("SELECT n FROM Notice n WHERE n.recipientType = 'all' AND n.type = 'reminder' ORDER BY n.sendTime DESC")
    List<Notice> findReminderNotices();
    
    /**
     * 根据班级ID查询班级通知
     */
    @Query("SELECT n FROM Notice n WHERE n.recipientType = 'class' AND n.recipientId = :classId ORDER BY n.sendTime DESC")
    List<Notice> findByClassId(@Param("classId") String classId);
    
    /**
     * 根据学生ID查询个别沟通通知
     */
    @Query("SELECT n FROM Notice n WHERE n.recipientType = 'student' AND n.recipientId = :studentId ORDER BY n.sendTime DESC")
    List<Notice> findByStudentId(@Param("studentId") String studentId);
    
    /**
     * 查询最新的通知（按时间排序）
     */
    @Query("SELECT n FROM Notice n ORDER BY n.sendTime DESC")
    List<Notice> findAllOrderBySendTimeDesc();
    
    /**
     * 查询未读的个别沟通通知
     */
    @Query("SELECT n FROM Notice n WHERE n.parentOpenId = :parentOpenId AND n.isRead = false ORDER BY n.sendTime DESC")
    List<Notice> findUnreadNoticesByParentOpenId(@Param("parentOpenId") String parentOpenId);
}
