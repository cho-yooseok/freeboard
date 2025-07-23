// src/main/java/com/example/freeboard/repository/PostRepository.java
package com.example.freeboard.repository;

import com.example.freeboard.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // 모든 게시글 조회 시 author 정보를 Eagerly Fetch (Fetch Join)
    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author",
            countQuery = "SELECT COUNT(p) FROM Post p")
    Page<Post> findAllWithAuthor(Pageable pageable);

    // 단일 게시글 조회 시 author 정보를 Eagerly Fetch (Fetch Join)
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :id")
    Optional<Post> findByIdWithAuthor(Long id);

    // 검색 기능 추가: 제목 또는 내용에 검색어가 포함된 게시글을 조회 (작성자 정보도 함께 Fetch)
    // 검색어는 대소문자 구분 없이, 부분 일치 검색 (LIKE %searchKeyword%)
    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :searchKeyword, '%'))",
            countQuery = "SELECT COUNT(p) FROM Post p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :searchKeyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :searchKeyword, '%'))")
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseWithAuthor(String searchKeyword, Pageable pageable);
}