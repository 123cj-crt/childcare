package com.child2.controller;

import com.child2.common.R;
import com.child2.dto.WeChatLoginRequest;
import com.child2.service.WeChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wechat")
public class WeChatLoginController {

    @Autowired
    private WeChatService weChatService;

    @PostMapping("/login")
    public R<String> login(@RequestBody WeChatLoginRequest request) {
        // Implement WeChat login logic here
        // 1. Call WeChat API to get openid and session_key
        // 2. Authenticate or register user
        // 3. Generate and return token
        return weChatService.weChatLogin(request);
    }
}