package com.child2.repository;

import com.child2.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 考勤数据访问层
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    /**
     * 根据学生姓名查询考勤记录
     */
    List<Attendance> findByStudentName(String studentName);
    
    /**
     * 根据课程名称查询考勤记录
     */
    List<Attendance> findByCourseName(String courseName);
    
    /**
     * 根据日期查询考勤记录
     */
    List<Attendance> findByDate(LocalDate date);
    
    /**
     * 根据考勤状态查询考勤记录
     */
    List<Attendance> findByStatus(String status);
    
    /**
     * 根据学生ID查询考勤记录
     */
    List<Attendance> findByStudentId(Long studentId);
    
    /**
     * 根据课程ID查询考勤记录
     */
    List<Attendance> findByCourseId(Long courseId);
    
    /**
     * 根据日期范围查询考勤记录
     */
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * 根据学生姓名和日期查询考勤记录
     */
    List<Attendance> findByStudentNameAndDate(String studentName, LocalDate date);
    
    /**
     * 根据课程名称和日期查询考勤记录
     */
    List<Attendance> findByCourseNameAndDate(String courseName, LocalDate date);
    
    /**
     * 查询指定日期的所有考勤记录，按时间排序
     */
    @Query("SELECT a FROM Attendance a WHERE a.date = :date ORDER BY a.time ASC")
    List<Attendance> findByDateOrderByTime(@Param("date") LocalDate date);
    
    /**
     * 查询指定学生的考勤记录，按日期降序排序
     */
    @Query("SELECT a FROM Attendance a WHERE a.studentName = :studentName ORDER BY a.date DESC")
    List<Attendance> findByStudentNameOrderByDateDesc(@Param("studentName") String studentName);
}
