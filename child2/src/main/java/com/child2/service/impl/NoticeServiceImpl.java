package com.child2.service.impl;

import com.child2.entity.Notice;
import com.child2.repository.NoticeRepository;
import com.child2.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 通知服务实现类
 */
@Service
public class NoticeServiceImpl implements NoticeService {
    
    @Autowired
    private NoticeRepository noticeRepository;
    
    @Override
    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }
    
    @Override
    public Optional<Notice> getNoticeById(Long id) {
        return noticeRepository.findById(id);
    }
    
    @Override
    public Notice createNotice(Notice notice) {
        return noticeRepository.save(notice);
    }
    
    @Override
    public Notice updateNotice(Long id, Notice noticeDetails) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + id));
        
        notice.setTitle(noticeDetails.getTitle());
        notice.setContent(noticeDetails.getContent());
        notice.setType(noticeDetails.getType());
        notice.setRecipientType(noticeDetails.getRecipientType());
        notice.setRecipientId(noticeDetails.getRecipientId());
        notice.setRecipientName(noticeDetails.getRecipientName());
        notice.setSendTime(noticeDetails.getSendTime());
        notice.setSenderId(noticeDetails.getSenderId());
        notice.setSenderName(noticeDetails.getSenderName());
        notice.setIsRead(noticeDetails.getIsRead());
        notice.setParentOpenId(noticeDetails.getParentOpenId());
        
        return noticeRepository.save(notice);
    }
    
    @Override
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + id));
        noticeRepository.delete(notice);
    }
    
    @Override
    public List<Notice> getNoticesByRecipientType(String recipientType) {
        return noticeRepository.findByRecipientType(recipientType);
    }
    
    @Override
    public List<Notice> getNoticesByType(String type) {
        return noticeRepository.findByType(type);
    }
    
    @Override
    public List<Notice> getNoticesByRecipientId(String recipientId) {
        return noticeRepository.findByRecipientId(recipientId);
    }
    
    @Override
    public List<Notice> getNoticesByParentOpenIdAndType(String parentOpenId, String type) {
        return noticeRepository.findByParentOpenIdAndType(parentOpenId, type);
    }
    
    @Override
    public List<Notice> getNoticesByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        return noticeRepository.findBySendTimeBetween(startTime, endTime);
    }
    
    @Override
    public List<Notice> getAnnouncementNotices() {
        return noticeRepository.findAnnouncementNotices();
    }
    
    @Override
    public List<Notice> getReminderNotices() {
        return noticeRepository.findReminderNotices();
    }
    
    @Override
    public List<Notice> getNoticesByClassId(String classId) {
        return noticeRepository.findByClassId(classId);
    }
    
    @Override
    public List<Notice> getNoticesByStudentId(String studentId) {
        return noticeRepository.findByStudentId(studentId);
    }
    
    @Override
    public List<Notice> getLatestNotices() {
        return noticeRepository.findAllOrderBySendTimeDesc();
    }
    
    @Override
    public List<Notice> getUnreadNoticesByParentOpenId(String parentOpenId) {
        return noticeRepository.findUnreadNoticesByParentOpenId(parentOpenId);
    }
    
    @Override
    public Notice markAsRead(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + noticeId));
        notice.setIsRead(true);
        return noticeRepository.save(notice);
    }
    
    @Override
    public List<Notice> createBatchNotices(List<Notice> notices) {
        return noticeRepository.saveAll(notices);
    }
}
