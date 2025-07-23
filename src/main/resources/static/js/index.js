document.addEventListener('DOMContentLoaded', () => {
    const postListBody = document.getElementById('post-list');
    const paginationContainer = document.getElementById('pagination');
    const writePostButton = document.getElementById('write-post-button');

    if (localStorage.getItem('accessToken')) {
        writePostButton.style.display = 'inline-block';
    } else {
        writePostButton.style.display = 'none';
    }

    let currentPage = 0;
    const pageSize = 10;

    async function fetchPosts(page = 0) {
        postListBody.innerHTML = '<tr><td colspan="5" class="no-posts">게시글을 불러오는 중...</td></tr>';
        try {
            const response = await fetch(`/api/posts?page=${page}&size=${pageSize}&sort=createdAt,desc`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`게시글 로드 실패: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const pageData = await response.json();
            const posts = pageData.content;
            const totalPages = pageData.totalPages;
            const totalElements = pageData.totalElements;

            renderPosts(posts);
            renderPagination(totalPages, pageData.number);

            if (totalElements === 0) {
                postListBody.innerHTML = '<tr><td colspan="5" class="no-posts">아직 게시글이 없습니다.</td></tr>';
            }

        } catch (error) {
            console.error('게시글 로드 중 오류 발생:', error);
            postListBody.innerHTML = '<tr><td colspan="5" class="no-posts">게시글을 불러오는데 실패했습니다. 오류: ' + error.message + '</td></tr>';
        }
    }

    function renderPosts(posts) {
        postListBody.innerHTML = '';
        posts.forEach(post => {
            const row = document.createElement('tr');
            const createdAt = new Date(post.createdAt);
            const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')}`;

            row.innerHTML = `
                <td>${post.id}</td>
                <td><a href="/post-detail.html?id=${post.id}">${post.title}</a></td>
                <td>${post.authorUsername}</td>
                <td>${formattedDate}</td>
                <td>${post.viewCount}</td>
            `;
            postListBody.appendChild(row);
        });
    }

    function renderPagination(totalPages, currentPageNumber) {
        paginationContainer.innerHTML = '';

        const prevButton = document.createElement('span');
        prevButton.textContent = '이전';
        prevButton.classList.add('page-link');
        if (currentPageNumber > 0) {
            prevButton.classList.remove('disabled');
            prevButton.addEventListener('click', () => {
                currentPage = currentPageNumber - 1;
                fetchPosts(currentPage);
            });
        } else {
            prevButton.classList.add('disabled');
            prevButton.style.pointerEvents = 'none';
        }
        paginationContainer.appendChild(prevButton);

        let startPage = Math.max(0, currentPageNumber - 2);
        let endPage = Math.min(totalPages - 1, currentPageNumber + 2);

        if (endPage - startPage < 4) {
            if (startPage === 0) {
                endPage = Math.min(totalPages - 1, 4);
            } else if (endPage === totalPages - 1) {
                startPage = Math.max(0, totalPages - 5);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            let elementToAdd; // 추가할 요소를 저장할 변수

            if (i === currentPageNumber) {
                // 현재 페이지는 <a>가 아닌 <span>으로 생성하여 직접 추가
                const currentPageSpan = document.createElement('span');
                currentPageSpan.textContent = i + 1;
                currentPageSpan.classList.add('current-page');
                elementToAdd = currentPageSpan;
            } else {
                // 그 외 페이지는 <a>로 생성
                const pageLink = document.createElement('a');
                pageLink.textContent = i + 1;
                pageLink.href = '#';
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i;
                    fetchPosts(currentPage);
                });
                elementToAdd = pageLink;
            }
            paginationContainer.appendChild(elementToAdd); // 여기서 생성된 요소를 DOM에 추가
        }

        const nextButton = document.createElement('span');
        nextButton.textContent = '다음';
        nextButton.classList.add('page-link');
        if (currentPageNumber < totalPages - 1) {
            nextButton.classList.remove('disabled');
            nextButton.addEventListener('click', () => {
                currentPage = currentPageNumber + 1;
                fetchPosts(currentPage);
            });
        } else {
            nextButton.classList.add('disabled');
            nextButton.style.pointerEvents = 'none';
        }
        paginationContainer.appendChild(nextButton);
    }

    fetchPosts(currentPage);
});