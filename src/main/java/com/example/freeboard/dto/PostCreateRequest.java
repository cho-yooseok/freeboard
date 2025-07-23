package com.example.freeboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCreateRequest {
    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 255, message = "제목은 최대 255자까지 가능합니다.")
    private String title;

    @NotBlank(message = "내용은 필수입니다.")
    @Size(max = 65535, message = "내용은 최대 65535자까지 가능합니다.") // TEXT 타입에 맞춰 적절히 조절
    private String content;
}