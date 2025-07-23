package com.example.freeboard.service;

import com.example.freeboard.dto.CommentCreateRequest;
import com.example.freeboard.dto.CommentUpdateRequest;
import com.example.freeboard.entity.Comment;
import com.example.freeboard.entity.Post;
import com.example.freeboard.entity.User;
import com.example.freeboard.exception.ResourceNotFoundException;
import com.example.freeboard.repository.CommentRepository;
import com.example.freeboard.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    // 특정 게시글의 댓글 조회
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션
    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }

    // 댓글 생성 (로그인된 사용자와 연결)
    @Transactional
    public Comment createComment(Long postId, CommentCreateRequest commentRequest, User author) { // DTO로 변경
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("게시글을 찾을 수 없습니다. (ID: " + postId + ")"));

        Comment comment = new Comment(); // 새로운 Comment 엔티티 생성
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(commentRequest.getContent()); // DTO에서 내용 설정
        return commentRepository.save(comment);
    }

    // 댓글 수정 (작성자만 수정 가능)
    @Transactional
    public Comment updateComment(Long id, CommentUpdateRequest commentRequest, User currentUser) { // DTO로 변경
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("댓글을 찾을 수 없습니다. (ID: " + id + ")"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("이 댓글을 수정할 권한이 없습니다.");
        }
        comment.setContent(commentRequest.getContent()); // DTO에서 내용 설정
        return commentRepository.save(comment);
    }

    // 댓글 삭제 (작성자만 삭제 가능)
    @Transactional // 삭제는 변경이므로 트랜잭션 필요
    public void deleteComment(Long id, User currentUser) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("댓글을 찾을 수 없습니다. (ID: " + id + ")"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("이 댓글을 삭제할 권한이 없습니다.");
        }
        commentRepository.delete(comment);
    }
}