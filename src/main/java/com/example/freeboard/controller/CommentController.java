package com.example.freeboard.controller;

import com.example.freeboard.dto.CommentCreateRequest;
import com.example.freeboard.dto.CommentUpdateRequest;
import com.example.freeboard.entity.Comment;
import com.example.freeboard.entity.User;
import com.example.freeboard.service.CommentService;
import com.example.freeboard.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService; // 추가 (User 엔티티 재조회용)

    @Autowired
    public CommentController(CommentService commentService, UserService userService) {
        this.commentService = commentService;
        this.userService = userService;
    }

    // 특정 게시글의 댓글 조회 - 로그인 없이 접근 가능
    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // 댓글 생성 (로그인 후 접근 가능)
    @PostMapping
    public ResponseEntity<Comment> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest commentRequest, // DTO로 변경 및 @Valid 추가
            @AuthenticationPrincipal UserDetails userDetails) { // UserDetails로 변경
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 찾을 수 없습니다.")); // 이 예외는 발생하면 안 되지만, 방어 코드

        Comment createdComment = commentService.createComment(postId, commentRequest, currentUser); // DTO 전달
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    // 댓글 수정 (작성자만 가능)
    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest commentRequest, // DTO로 변경 및 @Valid 추가
            @AuthenticationPrincipal UserDetails userDetails) { // UserDetails로 변경
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 찾을 수 없습니다."));

        Comment updatedComment = commentService.updateComment(commentId, commentRequest, currentUser); // DTO 전달
        return ResponseEntity.ok(updatedComment);
    }

    // 댓글 삭제 (작성자만 가능)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) { // UserDetails로 변경
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 찾을 수 없습니다."));

        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }
}