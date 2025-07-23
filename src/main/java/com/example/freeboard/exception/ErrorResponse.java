package com.example.freeboard.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL) // null 값은 JSON에 포함하지 않음
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error; // HttpStatus 에러 이름 (e.g., NOT_FOUND, CONFLICT)
    private String message;
    private String path;
    private Map<String, String> errors; // 유효성 검사 오류 목록 (필드명: 메시지)

    public ErrorResponse(LocalDateTime timestamp, int status, String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = HttpStatus.valueOf(status).getReasonPhrase();
        this.message = message;
        this.path = path;
    }

    public ErrorResponse(LocalDateTime timestamp, int status, String message, String path, Map<String, String> errors) {
        this(timestamp, status, message, path);
        this.errors = errors;
    }
}