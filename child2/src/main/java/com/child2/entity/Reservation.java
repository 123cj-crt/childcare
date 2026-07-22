package com.child2.entity;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private String courseName;

    // 可以添加学生ID，如果需要关联学生信息
    private Long studentId;

    private String childName; // 新增字段，用于存储孩子名字

    private LocalDate reservationDate;
    private LocalTime reservationTime;

    @Column(nullable = false)
    private String status; // 例如: pending, approved, rejected

    // Constructors
    public Reservation() {
    }

    public Reservation(Long courseId, String courseName, Long studentId, String childName, LocalDate reservationDate, LocalTime reservationTime, String status) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.studentId = studentId;
        this.childName = childName;
        this.reservationDate = reservationDate;
        this.reservationTime = reservationTime;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public LocalTime getReservationTime() {
        return reservationTime;
    }

    public void setReservationTime(LocalTime reservationTime) {
        this.reservationTime = reservationTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Reservation{" +
               "id=" + id +
               ", courseId=" + courseId +
               ", courseName='" + courseName + '\'' +
               ", studentId=" + studentId +
               ", childName='" + childName + '\'' +
               ", reservationDate=" + reservationDate +
               ", reservationTime=" + reservationTime +
               ", status='" + status + '\'' +
               '}';
    }
}