package com.child2.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.child2.common.R;
import com.child2.dto.WeChatLoginRequest;
import com.child2.service.WeChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeChatServiceImpl implements WeChatService {

    @Value("${wechat.appid}")
    private String appid;

    @Value("${wechat.secret}")
    private String secret;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public R<String> weChatLogin(WeChatLoginRequest request) {
        String code = request.getCode();
        String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appid + "&secret=" + secret + "&js_code=" + code + "&grant_type=authorization_code";
        String response = restTemplate.getForObject(url, String.class);
        JSONObject jsonObject = JSON.parseObject(response);

        String openid = jsonObject.getString("openid");
        String sessionKey = jsonObject.getString("session_key");
        String errcode = jsonObject.getString("errcode");

        if (errcode != null) {
            return R.error("微信登录失败：" + jsonObject.getString("errmsg"));
        }

        // TODO: 根据 openid 判断用户是否已注册
        // TODO: 如果未注册，则自动注册新用户，保存 avatarUrl 和 nickName
        // TODO: 如果已注册，则更新用户信息
        // TODO: 生成自定义登录态（例如 JWT token）并返回给前端

        System.out.println("Received WeChat login request: " + request);
        System.out.println("OpenID: " + openid);
        System.out.println("SessionKey: " + sessionKey);

        // 示例：暂时返回一个成功的R对象和模拟token
        JSONObject result = new JSONObject();
        result.put("token", "mock_token_for_" + openid);
        result.put("openid", openid);
        return R.success(result.toJSONString());
    }
}