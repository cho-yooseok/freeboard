package com.example.freeboard.dto;

import com.example.freeboard.entity.Post;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String authorUsername; // 작성자 이름만 필요
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer viewCount;

    public PostResponseDto(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorUsername = post.getAuthor() != null ? post.getAuthor().getUsername() : null;
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
        this.viewCount = post.getViewCount();
    }
}