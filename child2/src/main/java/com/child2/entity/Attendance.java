package com.child2.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 考勤信息实体类
 */
@Data
@Entity
@Table(name = "attendance")
public class Attendance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String studentName; // 学生姓名
    
    @Column(nullable = false)
    private String courseName; // 课程名字
    
    @Column(nullable = false)
    private LocalDate date; // 日期
    
    @Column(nullable = false)
    private String status; // 考勤状态：present(出勤), absent(缺勤), late(迟到), leave(请假)
    
    @Column
    private LocalTime time; // 时间
    
    @Column
    private String notes; // 备注
    
    @Column
    private Long studentId; // 学生ID（可选，用于关联学生信息）
    
    @Column
    private Long courseId; // 课程ID（可选，用于关联课程信息）
    
    // 构造函数
    public Attendance() {}
    
    public Attendance(String studentName, String courseName, LocalDate date, String status) {
        this.studentName = studentName;
        this.courseName = courseName;
        this.date = date;
        this.status = status;
    }
    
    public Attendance(String studentName, String courseName, LocalDate date, String status, LocalTime time, String notes) {
        this.studentName = studentName;
        this.courseName = courseName;
        this.date = date;
        this.status = status;
        this.time = time;
        this.notes = notes;
    }
}
