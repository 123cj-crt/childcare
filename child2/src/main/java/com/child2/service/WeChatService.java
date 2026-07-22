package com.child2.service;

import com.child2.common.R;
import com.child2.dto.WeChatLoginRequest;

public interface WeChatService {
    R<String> weChatLogin(WeChatLoginRequest request);
}