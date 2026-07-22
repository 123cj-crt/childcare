package com.child2.service.impl;

import com.child2.entity.Attendance;
import com.child2.repository.AttendanceRepository;
import com.child2.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 考勤服务实现类
 */
@Service
public class AttendanceServiceImpl implements AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
    
    @Override
    public Optional<Attendance> getAttendanceById(Long id) {
        return attendanceRepository.findById(id);
    }
    
    @Override
    public Attendance createAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }
    
    @Override
    public Attendance updateAttendance(Long id, Attendance attendanceDetails) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));
        
        attendance.setStudentName(attendanceDetails.getStudentName());
        attendance.setCourseName(attendanceDetails.getCourseName());
        attendance.setDate(attendanceDetails.getDate());
        attendance.setStatus(attendanceDetails.getStatus());
        attendance.setTime(attendanceDetails.getTime());
        attendance.setNotes(attendanceDetails.getNotes());
        attendance.setStudentId(attendanceDetails.getStudentId());
        attendance.setCourseId(attendanceDetails.getCourseId());
        
        return attendanceRepository.save(attendance);
    }
    
    @Override
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));
        attendanceRepository.delete(attendance);
    }
    
    @Override
    public List<Attendance> getAttendanceByStudentName(String studentName) {
        return attendanceRepository.findByStudentName(studentName);
    }
    
    @Override
    public List<Attendance> getAttendanceByCourseName(String courseName) {
        return attendanceRepository.findByCourseName(courseName);
    }
    
    @Override
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }
    
    @Override
    public List<Attendance> getAttendanceByStatus(String status) {
        return attendanceRepository.findByStatus(status);
    }
    
    @Override
    public List<Attendance> getAttendanceByStudentId(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }
    
    @Override
    public List<Attendance> getAttendanceByCourseId(Long courseId) {
        return attendanceRepository.findByCourseId(courseId);
    }
    
    @Override
    public List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByDateBetween(startDate, endDate);
    }
    
    @Override
    public List<Attendance> createBatchAttendance(List<Attendance> attendanceList) {
        return attendanceRepository.saveAll(attendanceList);
    }
    
    @Override
    public List<Attendance> getAttendanceByStudentNameAndDate(String studentName, LocalDate date) {
        return attendanceRepository.findByStudentNameAndDate(studentName, date);
    }
    
    @Override
    public List<Attendance> getAttendanceByCourseNameAndDate(String courseName, LocalDate date) {
        return attendanceRepository.findByCourseNameAndDate(courseName, date);
    }
}
