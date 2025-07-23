document.addEventListener('DOMContentLoaded', async () => {
    const postForm = document.getElementById('post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-post-button');

    const titleError = document.getElementById('title-error');
    const contentError = document.getElementById('content-error');
    const generalError = document.getElementById('general-error'); // 이 요소를 참조

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    let isEditMode = false;

    if (postId) {
        isEditMode = true;
        formTitle.textContent = '게시글 수정';
        submitButton.textContent = '수정 완료';

        try {
            const response = await authenticatedFetch(`/api/posts/${postId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                generalError.textContent = `게시글 로드 실패: ${errorData.message || response.statusText}`;
                // 에러 발생 시에도 빨간 글씨를 보여줘야 하므로 return은 유지
                return;
            }

            const post = await response.json();

            const loggedInUsername = localStorage.getItem('username');
            if (!loggedInUsername || loggedInUsername !== post.authorUsername) {
                alert('이 게시글을 수정할 권한이 없습니다.');
                window.location.href = `/post-detail.html?id=${postId}`;
                return;
            }

            titleInput.value = post.title;
            contentInput.value = post.content;

            // ***** 추가할 코드: 게시글 정보 로드 성공 시 오류 메시지 숨기기 *****
            generalError.textContent = ''; // 메시지 내용을 비움
            generalError.style.display = 'none'; // 요소를 아예 숨김
            // ***************************************************************

        } catch (error) {
            console.error('게시글 상세 정보 로드 중 오류 발생:', error);
            generalError.textContent = '게시글 정보를 불러오는데 실패했습니다.';
            generalError.style.display = 'block'; // 오류 발생 시 다시 보이도록
            // ... (나머지 에러 처리 로직)
        }
    } else {
        if (!localStorage.getItem('accessToken')) {
            alert('게시글을 작성하려면 로그인해야 합니다.');
            window.location.href = '/login.html';
            return;
        }
        // 새 글 작성 모드에서는 '게시글 정보를 불러오는데 실패했습니다' 메시지가 나올 이유가 없으므로 숨김
        generalError.style.display = 'none';
    }


    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 에러 메시지 초기화
        titleError.textContent = '';
        contentError.textContent = '';
        generalError.textContent = ''; // 제출 시에도 초기화
        generalError.style.display = 'none'; // 제출 시에도 숨김

        const title = titleInput.value;
        const content = contentInput.value;

        let isValid = true;
        if (!title || title.trim().length === 0) {
            titleError.textContent = '제목은 필수입니다.';
            isValid = false;
        } else if (title.length > 255) {
            titleError.textContent = '제목은 최대 255자까지 가능합니다.';
            isValid = false;
        }

        if (!content || content.trim().length === 0) {
            contentError.textContent = '내용은 필수입니다.';
            isValid = false;
        } else if (content.length > 65535) {
            contentError.textContent = '내용은 너무 깁니다.';
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const requestBody = { title, content };
        let url = '/api/posts';
        let method = 'POST';

        if (isEditMode) {
            url = `/api/posts/${postId}`;
            method = 'PUT';
        }

        try {
            const response = await authenticatedFetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                alert(isEditMode ? '게시글이 성공적으로 수정되었습니다.' : '게시글이 성공적으로 작성되었습니다.');
                window.location.href = isEditMode ? `/post-detail.html?id=${postId}` : '/';
            } else {
                const errorData = await response.json();
                if (response.status === 400 && errorData.errors) {
                    for (const field in errorData.errors) {
                        if (field === 'title') {
                            titleError.textContent = errorData.errors[field];
                        } else if (field === 'content') {
                            contentError.textContent = errorData.errors[field];
                        }
                    }
                } else if (response.status === 403) {
                    generalError.textContent = errorData.message || '게시글을 수정/삭제할 권한이 없습니다.';
                } else {
                    generalError.textContent = errorData.message || '작업 중 오류가 발생했습니다.';
                }
                generalError.style.display = 'block'; // 오류 발생 시 보이도록
                console.error('API 오류:', errorData);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            generalError.textContent = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
            generalError.style.display = 'block'; // 오류 발생 시 보이도록
        }
    });
});