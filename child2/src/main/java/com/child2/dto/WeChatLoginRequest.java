package com.child2.dto;

import lombok.Data;

@Data
public class WeChatLoginRequest {
    private String code;
    private String avatarUrl;
    private String nickName;
}