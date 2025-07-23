package com.example.freeboard.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// HTTP 상태 코드 403 (Forbidden)으로 응답하도록 설정
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedPostAccessException extends RuntimeException {

    public UnauthorizedPostAccessException(String message) {
        super(message);
    }

    public UnauthorizedPostAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}