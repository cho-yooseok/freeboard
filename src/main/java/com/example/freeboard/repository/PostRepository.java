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
    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author", // p.author를 함께 가져옴
            countQuery = "SELECT COUNT(p) FROM Post p") // 페이징을 위한 count 쿼리도 명시
    Page<Post> findAllWithAuthor(Pageable pageable);

    // 단일 게시글 조회 시 author 정보를 Eagerly Fetch (Fetch Join)
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :id")
    Optional<Post> findByIdWithAuthor(Long id);
}