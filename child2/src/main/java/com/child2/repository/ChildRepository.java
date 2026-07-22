package com.child2.repository;

import com.child2.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 孩子信息仓库接口
 */
@Repository
public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByParentOpenId(String parentOpenId);
}