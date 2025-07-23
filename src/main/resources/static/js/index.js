document.addEventListener('DOMContentLoaded', async () => {
    const postListElem = document.getElementById('post-list');
    const paginationElem = document.getElementById('pagination');
    const searchInput = document.getElementById('search-input'); // 검색 입력 필드
    const searchButton = document.getElementById('search-button'); // 검색 버튼

    let currentPage = 0; // 현재 페이지 (0부터 시작)
    const pageSize = 10; // 페이지당 게시글 수
    let currentSearchKeyword = ''; // 현재 검색어

    // 게시글 목록을 로드하는 함수
    async function loadPosts(page = 0, searchKeyword = '') {
        postListElem.innerHTML = '<tr><td colspan="5" class="no-posts">게시글을 불러오는 중...</td></tr>';
        paginationElem.innerHTML = ''; // 페이지네이션 초기화

        currentPage = page;
        currentSearchKeyword = searchKeyword; // 현재 검색어 저장

        try {
            // 검색어가 있을 경우 쿼리 파라미터로 추가
            const url = `/api/posts?page=${page}&size=${pageSize}${searchKeyword ? `&search=${encodeURIComponent(searchKeyword)}` : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '게시글 로드 실패');
            }

            const pageData = await response.json();
            const posts = pageData.content;
            const totalPages = pageData.totalPages;

            postListElem.innerHTML = ''; // 기존 내용 지우기

            if (posts.length === 0) {
                postListElem.innerHTML = '<tr><td colspan="5" class="no-posts">게시글이 없습니다.</td></tr>';
            } else {
                posts.forEach(post => {
                    const row = document.createElement('tr');
                    const createdAt = new Date(post.createdAt);
                    const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')}`;

                    row.innerHTML = `
                        <td class="col-id">${post.id}</td>
                        <td class="col-title"><a href="/post-detail.html?id=${post.id}">${post.title}</a></td>
                        <td class="col-author">${post.authorUsername}</td>
                        <td class="col-date">${formattedDate}</td>
                        <td class="col-views">${post.viewCount}</td>
                    `;
                    postListElem.appendChild(row);
                });
            }

            // 페이지네이션 렌더링
            renderPagination(totalPages, currentPage);

        } catch (error) {
            console.error('게시글 로드 중 오류 발생:', error);
            postListElem.innerHTML = `<tr><td colspan="5" class="no-posts">게시글을 불러오는데 실패했습니다: ${error.message}</td></tr>`;
        }
    }

    // 페이지네이션 렌더링 함수
    function renderPagination(totalPages, currentPage) {
        paginationElem.innerHTML = '';

        const maxPagesToShow = 5; // 한 번에 보여줄 페이지 버튼 수
        let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

        // 끝 페이지가 부족하면 시작 페이지 조정
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(0, endPage - maxPagesToShow + 1);
        }

        // 이전 페이지 버튼
        if (currentPage > 0) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '이전';
            prevButton.addEventListener('click', () => loadPosts(currentPage - 1, currentSearchKeyword));
            paginationElem.appendChild(prevButton);
        }

        // 페이지 번호 버튼
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i + 1;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => loadPosts(i, currentSearchKeyword));
            paginationElem.appendChild(pageButton);
        }

        // 다음 페이지 버튼
        if (currentPage < totalPages - 1) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '다음';
            nextButton.addEventListener('click', () => loadPosts(currentPage + 1, currentSearchKeyword));
            paginationElem.appendChild(nextButton);
        }
    }

    // 검색 버튼 클릭 이벤트 리스너
    searchButton.addEventListener('click', () => {
        const searchKeyword = searchInput.value.trim();
        loadPosts(0, searchKeyword); // 검색 시 첫 페이지부터 로드
    });

    // 엔터 키로 검색 실행
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click(); // 검색 버튼 클릭 이벤트 트리거
        }
    });

    // 초기 게시글 로드
    loadPosts(currentPage, currentSearchKeyword);
});