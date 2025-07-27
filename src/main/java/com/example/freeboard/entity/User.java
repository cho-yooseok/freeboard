package com.example.freeboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.HashSet;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User implements UserDetails { // <-- UserDetails 인터페이스 구현

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonIgnore // 추가: JSON 응답 시 비밀번호 필드를 제외합니다.
    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Post> posts = new HashSet<>();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    // UserDetails 인터페이스 구현 메서드 시작
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 여기서는 간단하게 "ROLE_USER" 권한만 부여합니다.
        // 실제 애플리케이션에서는 역할(Role) 엔티티를 만들고 사용자에게 할당하여 관리합니다.
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    // Spring Security의 getUsername()과 겹치므로 @Override 제거.
    // @Override // 이 어노테이션은 제거하고, getter/setter로 lombok이 자동으로 생성하도록 두거나,
    // public String getUsername() { // 또는 직접 구현하여 사용
    //     return username;
    // }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부 (true = 만료되지 않음)
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠금 여부 (true = 잠기지 않음)
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명(비밀번호) 만료 여부 (true = 만료되지 않음)
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화 여부 (true = 활성화됨)
    }
    // UserDetails 인터페이스 구현 메서드 끝
}