package com.child2.service.impl;

import com.child2.entity.Teacher;
import com.child2.repository.TeacherRepository;
import com.child2.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Override
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @Override
    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }

    @Override
    public Teacher createTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    @Override
    public Teacher updateTeacher(Long id, Teacher teacherDetails) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id " + id));

        teacher.setName(teacherDetails.getName());
        teacher.setGender(teacherDetails.getGender());
        teacher.setPosition(teacherDetails.getPosition());
        teacher.setPhone(teacherDetails.getPhone());
        teacher.setHireDate(teacherDetails.getHireDate());
        teacher.setNotes(teacherDetails.getNotes());
        teacher.setCourseClassIds(teacherDetails.getCourseClassIds());

        return teacherRepository.save(teacher);
    }

    @Override
    public void deleteTeacher(Long id) {
        teacherRepository.deleteById(id);
    }
}