package com.child2.dto;

import com.child2.entity.Child;
import lombok.Data;

import java.util.List;

/**
 * 孩子信息绑定请求DTO
 */
@Data
public class ChildBindingRequest {
    private String childName;
    private Integer age;
    private String gender;
    private String relationship;
    private String parentName;
    private String phoneNumber;
}