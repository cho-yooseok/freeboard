package com.example.freeboard.dto;

public class AuthResponse {
    private String accessToken;
    // 토큰 유형, 만료일 등을 추가할 수 있습니다.

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    // Getter와 Setter
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}