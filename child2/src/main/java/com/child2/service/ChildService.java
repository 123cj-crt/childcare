package com.child2.service;

import com.child2.entity.Child;
import com.child2.repository.ChildRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * 孩子信息服务层
 */
@Service
public class ChildService {

    @Autowired
    private ChildRepository childRepository;

    /**
     * 保存孩子信息
     * @param child 孩子信息
     * @return 保存后的孩子信息
     */
    public Child saveChild(Child child) {
        return childRepository.save(child);
    }

    /**
     * 根据家长OpenID查找孩子信息
     * @param parentOpenId 家长微信OpenID
     * @return 孩子信息列表
     */
    public List<Child> getChildrenByParentOpenId(String parentOpenId) {
        return childRepository.findByParentOpenId(parentOpenId);
    }

    /**
     * 获取所有孩子信息（管理员使用）
     * @return 孩子信息列表
     */
    public List<Child> getAllChildren() {
        return childRepository.findAll();
    }

    /**
     * 更新孩子信息
     */
    public Optional<Child> updateChild(Long id, Child incoming) {
        return childRepository.findById(id).map(existing -> {
            if (incoming.getChildName() != null) existing.setChildName(incoming.getChildName());
            if (incoming.getGender() != null) existing.setGender(incoming.getGender());
            if (incoming.getAge() != null) existing.setAge(incoming.getAge());
            if (incoming.getParentName() != null) existing.setParentName(incoming.getParentName());
            if (incoming.getPhoneNumber() != null) existing.setPhoneNumber(incoming.getPhoneNumber());
            if (incoming.getRelationship() != null) existing.setRelationship(incoming.getRelationship());
            // parentOpenId 不允许在此更新
            return childRepository.save(existing);
        });
    }

    public Optional<Child> getById(Long id) {
        return childRepository.findById(id);
    }
}