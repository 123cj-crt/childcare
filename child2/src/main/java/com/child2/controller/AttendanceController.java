package com.child2.controller;

import com.child2.entity.Attendance;
import com.child2.service.AttendanceService;
import com.child2.common.R;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 考勤管理控制器
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    /**
     * 获取所有考勤记录
     */
    @GetMapping
    public R<List<Attendance>> getAllAttendance() {
        List<Attendance> attendanceList = attendanceService.getAllAttendance();
        return R.success(attendanceList);
    }
    
    /**
     * 根据ID获取考勤记录
     */
    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable String id) {
        try {
            Long numericId = Long.parseLong(id);
            Optional<Attendance> attendance = attendanceService.getAttendanceById(numericId);
            return attendance.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 创建考勤记录
     */
    @PostMapping
    public R<Attendance> createAttendance(@RequestBody Attendance attendance) {
        try {
            Attendance createdAttendance = attendanceService.createAttendance(attendance);
            return R.success(createdAttendance);
        } catch (Exception e) {
            return R.error("创建考勤记录失败: " + e.getMessage());
        }
    }
    
    /**
     * 批量创建考勤记录
     */
    @PostMapping("/batch")
    public R<List<Attendance>> createBatchAttendance(@RequestBody List<Attendance> attendanceList) {
        try {
            // 检查重复记录
            List<Attendance> filteredList = new ArrayList<>();
            for (Attendance attendance : attendanceList) {
                // 检查是否已存在相同的记录（学生姓名、日期、时间相同）
                List<Attendance> existingRecords = attendanceService.getAttendanceByStudentNameAndDate(
                    attendance.getStudentName(), attendance.getDate());
                
                boolean isDuplicate = existingRecords.stream().anyMatch(existing -> 
                    existing.getStudentName().equals(attendance.getStudentName()) &&
                    existing.getDate().equals(attendance.getDate()) &&
                    existing.getTime() != null && attendance.getTime() != null &&
                    existing.getTime().equals(attendance.getTime())
                );
                
                if (!isDuplicate) {
                    filteredList.add(attendance);
                }
            }
            
            if (filteredList.isEmpty()) {
                return R.success(new ArrayList<>());
            }
            
            List<Attendance> createdAttendanceList = attendanceService.createBatchAttendance(filteredList);
            return R.success(createdAttendanceList);
        } catch (Exception e) {
            return R.error("批量创建考勤记录失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新考勤记录
     */
    @PutMapping("/{id}")
    public R<Attendance> updateAttendance(@PathVariable String id, @RequestBody Attendance attendanceDetails) {
        try {
            Long numericId = Long.parseLong(id);
            Attendance updatedAttendance = attendanceService.updateAttendance(numericId, attendanceDetails);
            return R.success(updatedAttendance);
        } catch (NumberFormatException e) {
            return R.error("无效的ID格式");
        } catch (Exception e) {
            return R.error("更新考勤记录失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除考勤记录
     */
    @DeleteMapping("/{id}")
    public R<String> deleteAttendance(@PathVariable String id) {
        try {
            Long numericId = Long.parseLong(id);
            attendanceService.deleteAttendance(numericId);
            return R.success("考勤记录删除成功");
        } catch (NumberFormatException e) {
            return R.error("无效的ID格式");
        } catch (Exception e) {
            return R.error("删除考勤记录失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据学生姓名查询考勤记录
     */
    @GetMapping("/student/{studentName}")
    public R<List<Attendance>> getAttendanceByStudentName(@PathVariable String studentName) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByStudentName(studentName);
        return R.success(attendanceList);
    }
    
    /**
     * 根据课程名称查询考勤记录
     */
    @GetMapping("/course/{courseName}")
    public R<List<Attendance>> getAttendanceByCourseName(@PathVariable String courseName) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByCourseName(courseName);
        return R.success(attendanceList);
    }
    
    /**
     * 根据日期查询考勤记录
     */
    @GetMapping("/date/{date}")
    public R<List<Attendance>> getAttendanceByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByDate(date);
        return R.success(attendanceList);
    }
    
    /**
     * 根据考勤状态查询考勤记录
     */
    @GetMapping("/status/{status}")
    public R<List<Attendance>> getAttendanceByStatus(@PathVariable String status) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByStatus(status);
        return R.success(attendanceList);
    }
    
    /**
     * 根据学生ID查询考勤记录
     */
    @GetMapping("/student-id/{studentId}")
    public R<List<Attendance>> getAttendanceByStudentId(@PathVariable String studentId) {
        try {
            Long numericId = Long.parseLong(studentId);
            List<Attendance> attendanceList = attendanceService.getAttendanceByStudentId(numericId);
            return R.success(attendanceList);
        } catch (NumberFormatException e) {
            return R.error("无效的学生ID格式");
        }
    }
    
    /**
     * 根据课程ID查询考勤记录
     */
    @GetMapping("/course-id/{courseId}")
    public R<List<Attendance>> getAttendanceByCourseId(@PathVariable String courseId) {
        try {
            Long numericId = Long.parseLong(courseId);
            List<Attendance> attendanceList = attendanceService.getAttendanceByCourseId(numericId);
            return R.success(attendanceList);
        } catch (NumberFormatException e) {
            return R.error("无效的课程ID格式");
        }
    }
    
    /**
     * 根据日期范围查询考勤记录
     */
    @GetMapping("/date-range")
    public R<List<Attendance>> getAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByDateRange(startDate, endDate);
        return R.success(attendanceList);
    }
    
    /**
     * 根据学生姓名和日期查询考勤记录
     */
    @GetMapping("/student/{studentName}/date/{date}")
    public R<List<Attendance>> getAttendanceByStudentNameAndDate(
            @PathVariable String studentName,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByStudentNameAndDate(studentName, date);
        return R.success(attendanceList);
    }
    
    /**
     * 根据课程名称和日期查询考勤记录
     */
    @GetMapping("/course/{courseName}/date/{date}")
    public R<List<Attendance>> getAttendanceByCourseNameAndDate(
            @PathVariable String courseName,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByCourseNameAndDate(courseName, date);
        return R.success(attendanceList);
    }
}
