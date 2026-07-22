package com.child2.entity;

import lombok.Data;
import javax.persistence.*;

/**
 * 孩子信息实体类
 */
@Data
@Entity
@Table(name = "child_info")
public class Child {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String childName;
    
    @Column(nullable = false)
    private String gender;
    
    @Column(nullable = false)
    private Integer age;
    
    @Column(nullable = false)
    private String relationship; // 亲属关系
    
    @Column(nullable = false)
    private String phoneNumber;
    
    @Column(name = "parent_name", nullable = true)
    private String parentName; // 家长姓名
    
    @Column(nullable = false)
    private String parentOpenId; // 关联的家长微信OpenID
    
    // 其他字段...
}