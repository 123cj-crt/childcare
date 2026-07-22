package com.child2.controller;

import com.child2.entity.Course;
import com.child2.entity.Reservation;
import com.child2.entity.Teacher;
import com.child2.service.CourseService;
import com.child2.service.ReservationService;
import com.child2.service.TeacherService;
import com.child2.common.R;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 统计数据控制器
 */
@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private TeacherService teacherService;


    /**
     * 获取课程基本统计信息
     */
    @GetMapping("/course-basic")
    public R<Map<String, Object>> getCourseBasicStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String courseType) {
        
        try {
            List<Course> courses = courseService.getAllCourses();
            List<Reservation> reservations = reservationService.getAllReservations();
            
            // 应用筛选条件
            if (courseType != null && !courseType.isEmpty()) {
                courses = courses.stream()
                    .filter(c -> courseType.equals(c.getType()))
                    .collect(Collectors.toList());
            }
            
            // 计算基本统计
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCourses", courses.size());
            
            // 计算总课时数
            int totalCourseHours = courses.stream()
                .mapToInt(c -> c.getDuration() != null ? c.getDuration().intValue() : 0)
                .sum();
            stats.put("totalCourseHours", totalCourseHours);
            
            // 计算本周课程数
            LocalDate today = LocalDate.now();
            LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
            long weeklyCourses = courses.stream()
                .filter(c -> {
                    if (c.getStartDate() == null || c.getEndDate() == null) return false;
                    return !c.getStartDate().isAfter(today) && !c.getEndDate().isBefore(weekStart);
                })
                .count();
            stats.put("weeklyCourses", weeklyCourses);
            
            // 计算课程预约总数
            List<Long> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());
            long totalReservations = reservations.stream()
                .filter(r -> courseIds.contains(r.getCourseId()))
                .count();
            stats.put("totalReservations", totalReservations);
            
            
            // 计算课程完成率（最近30天）
            LocalDate thirtyDaysAgo = today.minusDays(30);
            long recentReservations = reservations.stream()
                .filter(r -> courseIds.contains(r.getCourseId()))
                .filter(r -> r.getReservationDate() != null && 
                           !r.getReservationDate().isBefore(thirtyDaysAgo) &&
                           !r.getReservationDate().isAfter(today))
                .count();
            
            long completedReservations = reservations.stream()
                .filter(r -> courseIds.contains(r.getCourseId()))
                .filter(r -> r.getReservationDate() != null && 
                           !r.getReservationDate().isBefore(thirtyDaysAgo) &&
                           !r.getReservationDate().isAfter(today))
                .filter(r -> "completed".equals(r.getStatus()))
                .count();
            
            int completionRate = recentReservations > 0 ? 
                (int) Math.round((double) completedReservations / recentReservations * 100) : 0;
            stats.put("courseCompletionRate", completionRate);
            
            return R.success(stats);
        } catch (Exception e) {
            return R.error("获取课程基本统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取课程类型分布统计
     */
    @GetMapping("/course-type-distribution")
    public R<Map<String, Integer>> getCourseTypeDistribution(
            @RequestParam(required = false) String courseType) {
        
        try {
            List<Course> courses = courseService.getAllCourses();
            
            if (courseType != null && !courseType.isEmpty()) {
                courses = courses.stream()
                    .filter(c -> courseType.equals(c.getType()))
                    .collect(Collectors.toList());
            }
            
            Map<String, Integer> distribution = new HashMap<>();
            distribution.put("基础课程", 0);
            distribution.put("特色课程", 0);
            distribution.put("兴趣课程", 0);
            distribution.put("活动课程", 0);
            
            for (Course course : courses) {
                String type = course.getType();
                if (type != null && distribution.containsKey(type)) {
                    distribution.put(type, distribution.get(type) + 1);
                }
            }
            
            return R.success(distribution);
        } catch (Exception e) {
            return R.error("获取课程类型分布失败: " + e.getMessage());
        }
    }

    /**
     * 获取每日课程数量统计
     */
    @GetMapping("/daily-courses")
    public R<Map<String, Object>> getDailyCoursesStats(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) String courseType) {
        
        try {
            List<Course> courses = courseService.getAllCourses();
            
            if (courseType != null && !courseType.isEmpty()) {
                courses = courses.stream()
                    .filter(c -> courseType.equals(c.getType()))
                    .collect(Collectors.toList());
            }
            
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            Map<String, Integer> dailyCounts = new LinkedHashMap<>();
            LocalDate current = start;
            while (!current.isAfter(end)) {
                final LocalDate date = current;
                int count = (int) courses.stream()
                    .filter(c -> c.getStartDate() != null && c.getEndDate() != null &&
                               !c.getStartDate().isAfter(date) && !c.getEndDate().isBefore(date))
                    .count();
                dailyCounts.put(date.format(DateTimeFormatter.ofPattern("MM-dd")), count);
                current = current.plusDays(1);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("labels", new ArrayList<>(dailyCounts.keySet()));
            result.put("data", new ArrayList<>(dailyCounts.values()));
            
            return R.success(result);
        } catch (Exception e) {
            return R.error("获取每日课程统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取课程时长分布统计
     */
    @GetMapping("/course-duration")
    public R<Map<String, Object>> getCourseDurationStats(
            @RequestParam(required = false) String courseType) {
        
        try {
            List<Course> courses = courseService.getAllCourses();
            
            if (courseType != null && !courseType.isEmpty()) {
                courses = courses.stream()
                    .filter(c -> courseType.equals(c.getType()))
                    .collect(Collectors.toList());
            }
            
            Map<String, Integer> durationRanges = new HashMap<>();
            durationRanges.put("10-30分钟", 0);
            durationRanges.put("31-60分钟", 0);
            durationRanges.put("61-90分钟", 0);
            durationRanges.put("91-120分钟", 0);
            durationRanges.put("120分钟以上", 0);
            
            for (Course course : courses) {
                if (course.getDuration() != null) {
                    int duration = course.getDuration().intValue();
                    if (duration >= 10 && duration <= 30) {
                        durationRanges.put("10-30分钟", durationRanges.get("10-30分钟") + 1);
                    } else if (duration <= 60) {
                        durationRanges.put("31-60分钟", durationRanges.get("31-60分钟") + 1);
                    } else if (duration <= 90) {
                        durationRanges.put("61-90分钟", durationRanges.get("61-90分钟") + 1);
                    } else if (duration <= 120) {
                        durationRanges.put("91-120分钟", durationRanges.get("91-120分钟") + 1);
                    } else {
                        durationRanges.put("120分钟以上", durationRanges.get("120分钟以上") + 1);
                    }
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("labels", new ArrayList<>(durationRanges.keySet()));
            result.put("data", new ArrayList<>(durationRanges.values()));
            
            return R.success(result);
        } catch (Exception e) {
            return R.error("获取课程时长分布失败: " + e.getMessage());
        }
    }

    /**
     * 获取教师课程负载统计
     */
    @GetMapping("/teacher-load")
    public R<Map<String, Object>> getTeacherLoadStats(
            @RequestParam(required = false) String courseType) {
        
        try {
            List<Course> courses = courseService.getAllCourses();
            List<Teacher> teachers = teacherService.getAllTeachers();
            
            if (courseType != null && !courseType.isEmpty()) {
                courses = courses.stream()
                    .filter(c -> courseType.equals(c.getType()))
                    .collect(Collectors.toList());
            }
            
            Map<Long, Integer> teacherCourseCounts = new HashMap<>();
            for (Teacher teacher : teachers) {
                teacherCourseCounts.put(teacher.getId(), 0);
            }
            
            for (Course course : courses) {
                if (course.getTeacherId() != null && teacherCourseCounts.containsKey(course.getTeacherId())) {
                    teacherCourseCounts.put(course.getTeacherId(), 
                        teacherCourseCounts.get(course.getTeacherId()) + 1);
                }
            }
            
            // 按课程数量排序
            List<Map.Entry<Long, Integer>> sortedEntries = teacherCourseCounts.entrySet()
                .stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .collect(Collectors.toList());
            
            List<String> teacherNames = new ArrayList<>();
            List<Integer> courseCounts = new ArrayList<>();
            
            for (Map.Entry<Long, Integer> entry : sortedEntries) {
                Teacher teacher = teachers.stream()
                    .filter(t -> t.getId().equals(entry.getKey()))
                    .findFirst()
                    .orElse(null);
                if (teacher != null) {
                    teacherNames.add(teacher.getName());
                    courseCounts.add(entry.getValue());
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("labels", teacherNames);
            result.put("data", courseCounts);
            
            return R.success(result);
        } catch (Exception e) {
            return R.error("获取教师课程负载失败: " + e.getMessage());
        }
    }

    /**
     * 获取预约状态统计
     */
    @GetMapping("/reservation-status")
    public R<Map<String, Integer>> getReservationStatusStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            List<Reservation> reservations = reservationService.getAllReservations();
            
            if (startDate != null && endDate != null) {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                reservations = reservations.stream()
                    .filter(r -> r.getReservationDate() != null &&
                               !r.getReservationDate().isBefore(start) &&
                               !r.getReservationDate().isAfter(end))
                    .collect(Collectors.toList());
            }
            
            Map<String, Integer> statusCounts = new HashMap<>();
            statusCounts.put("已完成", 0);
            statusCounts.put("已取消", 0);
            statusCounts.put("待确认", 0);
            
            for (Reservation reservation : reservations) {
                String status = reservation.getStatus();
                if ("completed".equals(status)) {
                    statusCounts.put("已完成", statusCounts.get("已完成") + 1);
                } else if ("cancelled".equals(status)) {
                    statusCounts.put("已取消", statusCounts.get("已取消") + 1);
                } else if ("pending".equals(status)) {
                    statusCounts.put("待确认", statusCounts.get("待确认") + 1);
                }
            }
            
            return R.success(statusCounts);
        } catch (Exception e) {
            return R.error("获取预约状态统计失败: " + e.getMessage());
        }
    }

    /**
     * 导出统计数据
     */
    @GetMapping("/export")
    public R<Map<String, Object>> exportStatsData(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String courseType) {
        
        try {
            // 获取所有统计数据
            R<Map<String, Object>> basicStats = getCourseBasicStats(startDate, endDate, courseType);
            R<Map<String, Integer>> typeDistribution = getCourseTypeDistribution(courseType);
            R<Map<String, Integer>> statusStats = getReservationStatusStats(startDate, endDate);
            R<Map<String, Object>> teacherLoad = getTeacherLoadStats(courseType);
            
            Map<String, Object> exportData = new HashMap<>();
            exportData.put("basicStats", basicStats.getData());
            exportData.put("typeDistribution", typeDistribution.getData());
            exportData.put("statusStats", statusStats.getData());
            exportData.put("teacherLoad", teacherLoad.getData());
            exportData.put("exportTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            
            return R.success(exportData);
        } catch (Exception e) {
            return R.error("导出统计数据失败: " + e.getMessage());
        }
    }
}
