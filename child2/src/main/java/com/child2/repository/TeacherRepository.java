package com.child2.repository;

import com.child2.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    
    // 根据姓名查询教师
    List<Teacher> findByNameContaining(String name);
    
    // 根据电话号码查询教师
    Teacher findByPhone(String phone);
    
    // 根据职位查询教师
    List<Teacher> findByPosition(String position);
    
    // 根据性别查询教师
    List<Teacher> findByGender(String gender);
    
    // 自定义查询：查找包含特定课程班级ID的教师
    @Query("SELECT t FROM Teacher t WHERE t.courseClassIds LIKE %:courseClassId%")
    List<Teacher> findByCourseClassId(@Param("courseClassId") String courseClassId);
}