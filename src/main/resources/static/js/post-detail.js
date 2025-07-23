document.addEventListener('DOMContentLoaded', async () => {
    const postTitleElem = document.getElementById('post-title');
    const postAuthorElem = document.getElementById('post-author');
    const postDateElem = document.getElementById('post-date');
    const postViewsElem = document.getElementById('post-views');
    const postContentElem = document.getElementById('post-content');
    const detailPostTitleElem = document.getElementById('detail-post-title');

    const editButton = document.getElementById('edit-button');
    const deleteButton = document.getElementById('delete-button');
    const postErrorMessage = document.getElementById('post-error-message');

    // URL에서 게시글 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postErrorMessage.textContent = '잘못된 게시글 ID입니다.';
        postErrorMessage.style.display = 'block';
        return;
    }

    try {
        // 게시글 상세 조회 API 호출 (main.js의 authenticatedFetch 사용)
        const response = await authenticatedFetch(`/api/posts/${postId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            if (response.status === 404) {
                postErrorMessage.textContent = '요청하신 게시글을 찾을 수 없습니다.';
            } else {
                const errorData = await response.json();
                postErrorMessage.textContent = `게시글 로드 실패: ${errorData.message || response.statusText}`;
            }
            postErrorMessage.style.display = 'block';
            return;
        }

        const post = await response.json();

        // 게시글 정보 채우기
        postTitleElem.textContent = post.title;
        detailPostTitleElem.textContent = `${post.title} - 자유 게시판`;
        postAuthorElem.textContent = post.authorUsername; // 수정: post.author.username -> post.authorUsername

        const createdAt = new Date(post.createdAt);
        const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;
        postDateElem.textContent = formattedDate;

        postViewsElem.textContent = post.viewCount;
        postContentElem.textContent = post.content;

        // 현재 로그인된 사용자와 게시글 작성자가 일치하는 경우에만 수정/삭제 버튼 표시
        const loggedInUsername = localStorage.getItem('username');
        if (loggedInUsername && loggedInUsername === post.authorUsername) { // 수정: post.author.username -> post.authorUsername
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';

            // 수정 버튼 클릭 이벤트
            editButton.addEventListener('click', () => {
                window.location.href = `/edit-post.html?id=${post.id}`;
            });

            // 삭제 버튼 클릭 이벤트
            deleteButton.addEventListener('click', async () => {
                if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                    try {
                        const deleteResponse = await authenticatedFetch(`/api/posts/${post.id}`, {
                            method: 'DELETE',
                        });

                        if (deleteResponse.ok) {
                            alert('게시글이 성공적으로 삭제되었습니다.');
                            window.location.href = '/'; // 목록 페이지로 이동
                        } else {
                            const errorData = await deleteResponse.json();
                            alert(`게시글 삭제 실패: ${errorData.message || deleteResponse.statusText}`);
                            console.error('삭제 오류:', errorData);
                        }
                    } catch (deleteError) {
                        console.error('게시글 삭제 중 네트워크 오류:', deleteError);
                        alert('게시글 삭제 중 네트워크 오류가 발생했습니다.');
                    }
                }
            });
        }

    } catch (error) {
        console.error('게시글 상세 로드 중 오류 발생:', error);
        postErrorMessage.textContent = `게시글을 불러오는데 실패했습니다: ${error.message}`;
        postErrorMessage.style.display = 'block';
    }
});