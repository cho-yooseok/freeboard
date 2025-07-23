package com.example.freeboard.service;

import com.example.freeboard.dto.PostCreateRequest;
import com.example.freeboard.dto.PostResponseDto;
import com.example.freeboard.dto.PostUpdateRequest;
import com.example.freeboard.entity.Post;
import com.example.freeboard.entity.User;
import com.example.freeboard.exception.PostNotFoundException;
import com.example.freeboard.exception.UnauthorizedPostAccessException;
import com.example.freeboard.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> getAllPosts(Pageable pageable) {
        // PostRepository의 findAllWithAuthor 메서드 사용
        Page<Post> postsPage = postRepository.findAllWithAuthor(pageable);
        List<PostResponseDto> dtoList = postsPage.getContent().stream()
                .map(PostResponseDto::new)
                .collect(Collectors.toList());
        return new PageImpl<>(dtoList, pageable, postsPage.getTotalElements());
    }

    @Transactional // 조회수 증가로 인해 readOnly = true 제거
    public PostResponseDto getPostById(Long id) {
        // PostRepository의 findByIdWithAuthor 메서드 사용
        Post post = postRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new PostNotFoundException("게시글을 찾을 수 없습니다. ID: " + id));
        post.setViewCount(post.getViewCount() + 1); // 조회수 증가
        postRepository.save(post); // 조회수 업데이트 저장
        return new PostResponseDto(post);
    }

    @Transactional
    public PostResponseDto createPost(PostCreateRequest postRequest, User author) {
        if (author == null || author.getId() == null) {
            throw new UnauthorizedPostAccessException("게시글을 작성하려면 로그인 정보가 필요합니다.");
        }

        Post post = new Post();
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setAuthor(author);
        post.setViewCount(0);

        Post savedPost = postRepository.save(post);
        return new PostResponseDto(savedPost);
    }

    @Transactional
    public PostResponseDto updatePost(Long id, PostUpdateRequest postRequest, User currentUser) {
        Post post = postRepository.findById(id) // 여기서는 Fetch Join이 필수는 아님, Post 객체와 비교만 하면 되므로
                .orElseThrow(() -> new PostNotFoundException("수정할 게시글을 찾을 수 없습니다. ID: " + id));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedPostAccessException("이 게시글을 수정할 권한이 없습니다.");
        }

        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());

        Post updatedPost = postRepository.save(post);
        return new PostResponseDto(updatedPost);
    }

    @Transactional
    public void deletePost(Long id, User currentUser) {
        Post post = postRepository.findById(id) // 여기서는 Fetch Join이 필수는 아님
                .orElseThrow(() -> new PostNotFoundException("삭제할 게시글을 찾을 수 없습니다. ID: " + id));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedPostAccessException("이 게시글을 삭제할 권한이 없습니다.");
        }
        postRepository.delete(post);
    }
}