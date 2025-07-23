package com.example.freeboard.service;

import com.example.freeboard.dto.RegisterRequest;
import com.example.freeboard.entity.User;
import com.example.freeboard.exception.DuplicateUsernameException;
import com.example.freeboard.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 새로운 사용자를 등록합니다.
     * @param request 사용자 등록 요청 DTO
     * @return 등록된 User 엔티티
     * @throws DuplicateUsernameException 만약 사용자 이름이 이미 존재할 경우
     */
    @Transactional
    public User registerNewUser(RegisterRequest request) {
        if (isUsernameExists(request.getUsername())) {
            throw new DuplicateUsernameException("사용자 이름 '" + request.getUsername() + "'은(는) 이미 존재합니다.");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userRepository.save(user);
    }

    /**
     * 주어진 사용자 이름으로 사용자를 찾습니다.
     * @param username 찾을 사용자 이름
     * @return User 엔티티를 포함하는 Optional, 없으면 Optional.empty()
     */
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * 사용자 이름이 이미 존재하는지 확인합니다.
     * @param username 확인할 사용자 이름
     * @return 사용자 이름이 존재하면 true, 그렇지 않으면 false
     */
    @Transactional(readOnly = true)
    public boolean isUsernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
}