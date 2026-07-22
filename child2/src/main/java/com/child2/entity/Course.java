package com.child2.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Column;
import java.time.LocalDate;

@Entity
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer capacity; // 新增字段，用于存储课程人数
    private Double duration; // 新增字段，用于存储课程时长
    @Column(name = "teacher_id")
    private Long teacherId; // 新增字段，用于存储授课教师ID
    private String type; // 新增字段，用于存储课程类型
    private LocalDate startDate; // 新增字段，用于存储开始日期
    private LocalDate endDate; // 新增字段，用于存储结束日期
    private String schedule; // 新增字段，用于存储课程安排
    private String contact; // 新增字段，用于存储联系方式
    private String location; // 新增字段，用于存储上课地点
    @Column(name = "class_assigned")
    private String classAssigned; // 新增字段，用于存储开设班级

    // Constructors
    public Course() {
    }

    public Course(String name, String description, Double price, Integer capacity, Double duration, Long teacherId, String type, LocalDate startDate, LocalDate endDate, String schedule, String contact, String location, String classAssigned) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.capacity = capacity;
        this.duration = duration;
        this.teacherId = teacherId;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.schedule = schedule;
        this.contact = contact;
        this.location = location;
        this.classAssigned = classAssigned;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getClassAssigned() {
        return classAssigned;
    }

    public void setClassAssigned(String classAssigned) {
        this.classAssigned = classAssigned;
    }

    @Override
    public String toString() {
        return "Course{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", capacity=" + capacity +
                ", duration=" + duration +
                ", teacherId=" + teacherId +
                ", type='" + type + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", schedule='" + schedule + '\'' +
                ", contact='" + contact + '\'' +
                ", location='" + location + '\'' +
                ", classAssigned='" + classAssigned + '\'' +
                '}';
    }
}