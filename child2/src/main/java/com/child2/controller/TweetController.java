package com.child2.controller;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/tweets")
@CrossOrigin(origins = "*")
public class TweetController {

    // 使用内存存储推文数据（实际项目中应该使用数据库）
    private final Map<Long, Map<String, Object>> tweets = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(3); // 从3开始，避免与示例数据冲突

    public TweetController() {
        // 初始化一些示例数据
        initSampleData();
    }

    private void initSampleData() {
        Map<String, Object> tweet1 = new ConcurrentHashMap<>();
        tweet1.put("id", 1L);
        tweet1.put("image", "https://picsum.photos/400/200?random=1");
        tweet1.put("link", "https://mp.weixin.qq.com/s/example1");
        tweets.put(1L, tweet1);

        Map<String, Object> tweet2 = new ConcurrentHashMap<>();
        tweet2.put("id", 2L);
        tweet2.put("image", "https://picsum.photos/400/200?random=2");
        tweet2.put("link", "https://mp.weixin.qq.com/s/example2");
        tweets.put(2L, tweet2);
    }

    @GetMapping
    public List<Map<String, Object>> getAllTweets() {
        List<Map<String, Object>> tweetList = new ArrayList<>(tweets.values());
        System.out.println("获取所有推文，数量: " + tweetList.size());
        for (Map<String, Object> tweet : tweetList) {
            System.out.println("推文数据: " + tweet);
        }
        return tweetList;
    }

    @GetMapping("/test")
    public String test() {
        System.out.println("TweetController测试端点被调用");
        return "TweetController工作正常";
    }

    @PostMapping
    public Map<String, Object> createTweet(@RequestBody Map<String, Object> tweetData) {
        Long id = idGenerator.getAndIncrement();
        tweetData.put("id", id);
        tweets.put(id, new ConcurrentHashMap<>(tweetData));
        System.out.println("创建新推文，ID: " + id + ", 数据: " + tweetData);
        return tweetData;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateTweet(@PathVariable Long id, @RequestBody Map<String, Object> tweetData) {
        if (tweets.containsKey(id)) {
            tweetData.put("id", id);
            tweets.put(id, new ConcurrentHashMap<>(tweetData));
            return tweetData;
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public String deleteTweet(@PathVariable Long id) {
        if (tweets.containsKey(id)) {
            tweets.remove(id);
            return "删除成功";
        }
        return "推文不存在";
    }

    @GetMapping("/{id}")
    public Map<String, Object> getTweetById(@PathVariable Long id) {
        return tweets.get(id);
    }
}
