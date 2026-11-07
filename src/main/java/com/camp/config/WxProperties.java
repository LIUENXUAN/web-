package com.camp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "wx")
public class WxProperties {
    private String appid;
    private String secret;

    public String getAppid() { return appid; }
    public void setAppid(String appid) { this.appid = appid; }
    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
}
