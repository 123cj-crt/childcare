package com.child2.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String gender;
    private String position;
    private String phone;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate hireDate;
    private String notes;
    private String courseClassIds; // 存储课程班级ID的JSON字符串

    // 默认构造函数
    public Teacher() {
    }

    // 带参数的构造函数
    public Teacher(String name, String gender, String position, String phone, LocalDate hireDate, String notes, String courseClassIds) {
        this.name = name;
        this.gender = gender;
        this.position = position;
        this.phone = phone;
        this.hireDate = hireDate;
        this.notes = notes;
        this.courseClassIds = courseClassIds;
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCourseClassIds() {
        return courseClassIds;
    }

    public void setCourseClassIds(String courseClassIds) {
        this.courseClassIds = courseClassIds;
    }

    @Override
    public String toString() {
        return "Teacher{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", gender='" + gender + '\'' +
                ", position='" + position + '\'' +
                ", phone='" + phone + '\'' +
                ", hireDate=" + hireDate +
                ", notes='" + notes + '\'' +
                ", courseClassIds='" + courseClassIds + '\'' +
                '}';
    }
}