package com.child2.service;

import com.child2.entity.Attendance;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 考勤服务接口
 */
public interface AttendanceService {
    
    /**
     * 获取所有考勤记录
     */
    List<Attendance> getAllAttendance();
    
    /**
     * 根据ID获取考勤记录
     */
    Optional<Attendance> getAttendanceById(Long id);
    
    /**
     * 创建考勤记录
     */
    Attendance createAttendance(Attendance attendance);
    
    /**
     * 更新考勤记录
     */
    Attendance updateAttendance(Long id, Attendance attendanceDetails);
    
    /**
     * 删除考勤记录
     */
    void deleteAttendance(Long id);
    
    /**
     * 根据学生姓名查询考勤记录
     */
    List<Attendance> getAttendanceByStudentName(String studentName);
    
    /**
     * 根据课程名称查询考勤记录
     */
    List<Attendance> getAttendanceByCourseName(String courseName);
    
    /**
     * 根据日期查询考勤记录
     */
    List<Attendance> getAttendanceByDate(LocalDate date);
    
    /**
     * 根据考勤状态查询考勤记录
     */
    List<Attendance> getAttendanceByStatus(String status);
    
    /**
     * 根据学生ID查询考勤记录
     */
    List<Attendance> getAttendanceByStudentId(Long studentId);
    
    /**
     * 根据课程ID查询考勤记录
     */
    List<Attendance> getAttendanceByCourseId(Long courseId);
    
    /**
     * 根据日期范围查询考勤记录
     */
    List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * 批量创建考勤记录
     */
    List<Attendance> createBatchAttendance(List<Attendance> attendanceList);
    
    /**
     * 根据学生姓名和日期查询考勤记录
     */
    List<Attendance> getAttendanceByStudentNameAndDate(String studentName, LocalDate date);
    
    /**
     * 根据课程名称和日期查询考勤记录
     */
    List<Attendance> getAttendanceByCourseNameAndDate(String courseName, LocalDate date);
}
