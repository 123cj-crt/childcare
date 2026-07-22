package com.child2.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 通知消息实体类
 */
@Data
@Entity
@Table(name = "notices")
public class Notice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title; // 通知标题
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 通知内容
    
    @Column(nullable = false)
    private String type; // 通知类型：announcement(公告通知), reminder(提醒事项), individual(个别沟通)
    
    @Column(nullable = false)
    private String recipientType; // 接收对象类型：all(所有家长), class(班级), student(个别学生)
    
    @Column
    private String recipientId; // 接收对象ID（班级ID或学生ID）
    
    @Column(nullable = false)
    private String recipientName; // 接收对象名称
    
    @Column(nullable = false)
    private LocalDateTime sendTime; // 发送时间
    
    @Column
    private String senderId; // 发送者ID（管理员ID）
    
    @Column
    private String senderName; // 发送者姓名
    
    @Column
    private Boolean isRead; // 是否已读（用于个别沟通）
    
    @Column
    private String parentOpenId; // 家长微信OpenID（用于个别沟通）
    
    // 构造函数
    public Notice() {}
    
    public Notice(String title, String content, String type, String recipientType, String recipientName, LocalDateTime sendTime) {
        this.title = title;
        this.content = content;
        this.type = type;
        this.recipientType = recipientType;
        this.recipientName = recipientName;
        this.sendTime = sendTime;
    }
}
