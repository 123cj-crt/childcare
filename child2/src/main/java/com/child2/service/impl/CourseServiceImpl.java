package com.child2.service.impl;

import com.child2.entity.Course;
import com.child2.repository.CourseRepository;
import com.child2.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public List<Course> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        for (Course course : courses) {
            System.out.println("Fetched course classAssigned: " + course.getClassAssigned());
        }
        System.out.println("Fetched courses: " + courses);
        return courses;
    }

    @Override
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    @Override
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found on :: " + id));
        System.out.println("Updating course with classAssigned: " + courseDetails.getClassAssigned());
        course.setName(courseDetails.getName());
        course.setDescription(courseDetails.getDescription());
        course.setPrice(courseDetails.getPrice());
        course.setCapacity(courseDetails.getCapacity());
        course.setDuration(courseDetails.getDuration());
        course.setTeacherId(courseDetails.getTeacherId());
        course.setType(courseDetails.getType());
        course.setStartDate(courseDetails.getStartDate());
        course.setEndDate(courseDetails.getEndDate());
        course.setSchedule(courseDetails.getSchedule());
        course.setClassAssigned(courseDetails.getClassAssigned());
        course.setContact(courseDetails.getContact()); // 新增：更新联系方式
        course.setLocation(courseDetails.getLocation()); // 新增：更新上课地点
        return courseRepository.save(course);
    }

    @Override
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}