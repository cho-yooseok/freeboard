package com.example.freeboard.controller;

import com.example.freeboard.dto.CommentCreateRequest;
import com.example.freeboard.dto.CommentResponseDto;
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
    private final UserService userService;

    @Autowired
    public CommentController(CommentService commentService, UserService userService) {
        this.commentService = commentService;
        this.userService = userService;
    }

    // 특정 게시글의 댓글 조회 - 로그인 없이 접근 가능
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentResponseDto> commentDtos = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(commentDtos);
    }

    // 댓글 생성 (로그인 후 접근 가능)
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest commentRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 찾을 수 없습니다."));

        Comment createdComment = commentService.createComment(postId, commentRequest, currentUser);
        return new ResponseEntity<>(new CommentResponseDto(createdComment), HttpStatus.CREATED);
    }

    // 댓글 수정 (작성자만 가능)
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment( // 반환 타입 DTO로 유지
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest commentRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 찾을 수 없습니다."));

        // CommentService에서 이미 DTO로 변환하여 반환하므로 바로 받아서 반환
        CommentResponseDto updatedCommentDto = commentService.updateComment(commentId, commentRequest, currentUser);
        return ResponseEntity.ok(updatedCommentDto);
    }

    // 댓글 삭제 (작성자만 가능)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 찾을 수 없습니다."));

        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }
}