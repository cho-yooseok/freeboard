package com.example.freeboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message = "사용자 이름은 필수입니다.")
    @Size(min = 2, max = 20, message = "사용자 이름은 2자 이상 20자 이하여야 합니다.")
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 2, message = "비밀번호는 2자 이상이어야 합니다.")
    private String password;
}