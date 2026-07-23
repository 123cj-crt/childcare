package com.child2.controller;

import com.child2.dto.ChildBindingRequest;
import com.child2.entity.Child;
import com.child2.service.ChildService;
import com.child2.common.R;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * 孩子信息控制器
 */
@RestController
@RequestMapping("/api/child")
public class ChildController {

    @Autowired
    private ChildService childService;

    /**
     * 绑定孩子信息
     * @param childBindingRequest 孩子信息绑定请求
     * @param parentOpenId 家长微信OpenID (从请求头或认证信息中获取)
     * @return 绑定结果
     */
    @PostMapping("/bind")
    public R<Child> bindChildren(@RequestBody ChildBindingRequest childBindingRequest, @RequestHeader("X-WX-OPENID") String parentOpenId) {
        if (childBindingRequest == null || childBindingRequest.getChildName() == null || childBindingRequest.getChildName().isEmpty()) {
            return R.error("孩子姓名不能为空");
        }

        Child child = new Child();
        child.setChildName(childBindingRequest.getChildName());
        child.setAge(childBindingRequest.getAge());
        child.setGender(childBindingRequest.getGender());
        child.setRelationship(childBindingRequest.getRelationship());
        child.setParentName(childBindingRequest.getParentName());
        child.setPhoneNumber(childBindingRequest.getPhoneNumber());
        child.setParentOpenId(parentOpenId);

        Child savedChild = childService.saveChild(child);
        return R.success(savedChild);
    }

    /**
     * 获取当前家长绑定的孩子信息列表
     * @param parentOpenId 家长微信OpenID (从请求头或认证信息中获取)
     * @return 孩子信息列表
     */
    @GetMapping("/list")
    public R<List<Child>> getChildrenList(@RequestHeader("X-WX-OPENID") String parentOpenId) {
        List<Child> children = childService.getChildrenByParentOpenId(parentOpenId);
        return R.success(children);
    }

    /**
     * 管理端：获取所有孩子信息
     */
    @GetMapping("/all")
    public R<List<Child>> getAllChildren() {
        List<Child> children = childService.getAllChildren();
        return R.success(children);
    }

    /**
     * 管理端：更新孩子信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<Child> updateChild(@PathVariable Long id, @RequestBody Child child) {
        return childService.updateChild(id, child)
                .map(updated -> new ResponseEntity<>(updated, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * 管理端：根据ID获取孩子信息（用于排查 404 问题）
     */
    @GetMapping("/{id}")
    public ResponseEntity<Child> getChildById(@PathVariable Long id) {
        return childService.getById(id)
                .map(child -> new ResponseEntity<>(child, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
