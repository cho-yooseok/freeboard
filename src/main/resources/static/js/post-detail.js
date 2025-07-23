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

    const commentListElem = document.getElementById('comment-list');
    const commentFormContainer = document.getElementById('comment-form-container');
    const commentContentInput = document.getElementById('comment-content-input');
    const submitCommentButton = document.getElementById('submit-comment-button');
    const commentErrorMessage = document.getElementById('comment-error');

    // URL에서 게시글 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const loggedInUsername = localStorage.getItem('username'); // 로그인된 사용자 이름 가져오기
    // IMPORTANT: main.js와 통일하여 'accessToken' 사용
    const token = localStorage.getItem('accessToken'); // JWT 토큰 가져오기

    if (!postId) {
        postErrorMessage.textContent = '잘못된 게시글 ID입니다.';
        postErrorMessage.style.display = 'block';
        return;
    }

    // 게시글 상세 정보를 로드하는 함수
    async function loadPostDetail() {
        try {
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
            postAuthorElem.textContent = post.authorUsername; // 이미 정확함

            const createdAt = new Date(post.createdAt);
            const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;
            postDateElem.textContent = formattedDate;

            postViewsElem.textContent = post.viewCount;
            postContentElem.textContent = post.content;

            // 현재 로그인된 사용자와 게시글 작성자가 일치하는 경우에만 수정/삭제 버튼 표시
            if (loggedInUsername && loggedInUsername === post.authorUsername) {
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

            // 게시글 로드 후 댓글 로드
            loadComments();

        } catch (error) {
            console.error('게시글 상세 로드 중 오류 발생:', error);
            postErrorMessage.textContent = `게시글을 불러오는데 실패했습니다: ${error.message}`;
            postErrorMessage.style.display = 'block';
        }
    }

    // 댓글 목록을 로드하는 함수
    async function loadComments() {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('댓글 로드 실패:', errorData.message || response.statusText);
                commentListElem.innerHTML = `<p class="error-message">댓글을 불러오는데 실패했습니다: ${errorData.message || response.statusText}</p>`;
                return;
            }

            const comments = await response.json();
            commentListElem.innerHTML = ''; // 기존 댓글 제거

            if (comments.length === 0) {
                commentListElem.innerHTML = '<p class="no-comments">아직 댓글이 없습니다.</p>';
            } else {
                comments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'comment-item';
                    commentDiv.dataset.commentId = comment.id; // 댓글 ID 저장

                    const createdAt = new Date(comment.createdAt);
                    const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;

                    commentDiv.innerHTML = `
                        <div class="comment-meta">
                            <span class="comment-author">${comment.authorUsername}</span> <span class="comment-date">${formattedDate}</span>
                        </div>
                        <p class="comment-content">${comment.content}</p>
                        <div class="comment-actions">
                            ${loggedInUsername && loggedInUsername === comment.authorUsername ? // **이 부분 수정**
                        `<button class="btn-comment-edit" data-id="${comment.id}">수정</button>
                                 <button class="btn-comment-delete" data-id="${comment.id}">삭제</button>`
                        : ''}
                        </div>
                    `;
                    commentListElem.appendChild(commentDiv);
                });

                // 수정/삭제 버튼 이벤트 리스너 추가
                commentListElem.querySelectorAll('.btn-comment-edit').forEach(button => {
                    button.addEventListener('click', (event) => openEditCommentForm(event.target.dataset.id));
                });
                commentListElem.querySelectorAll('.btn-comment-delete').forEach(button => {
                    button.addEventListener('click', (event) => deleteComment(event.target.dataset.id));
                });
            }

        } catch (error) {
            console.error('댓글 로드 중 오류 발생:', error);
            commentListElem.innerHTML = `<p class="error-message">댓글을 불러오는데 실패했습니다: ${error.message}</p>`;
        }
    }

    // 댓글 작성 폼 표시 여부 결정
    if (token) {
        commentFormContainer.style.display = 'block';
    } else {
        commentFormContainer.style.display = 'none';
        commentErrorMessage.textContent = '로그인해야 댓글을 작성할 수 있습니다.';
        commentErrorMessage.style.display = 'block';
    }


    // 댓글 작성 버튼 클릭 이벤트
    submitCommentButton.addEventListener('click', async () => {
        const content = commentContentInput.value.trim();

        if (!content) {
            commentErrorMessage.textContent = '댓글 내용을 입력해주세요.';
            commentErrorMessage.style.display = 'block';
            return;
        }

        commentErrorMessage.style.display = 'none'; // 에러 메시지 숨김

        try {
            const response = await authenticatedFetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: content })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '댓글 작성 실패');
            }

            commentContentInput.value = ''; // 입력 필드 초기화
            alert('댓글이 성공적으로 작성되었습니다.');
            loadComments(); // 댓글 목록 새로고침

        } catch (error) {
            console.error('댓글 작성 중 오류 발생:', error);
            commentErrorMessage.textContent = `댓글 작성 실패: ${error.message}`;
            commentErrorMessage.style.display = 'block';
        }
    });

    // 댓글 수정 폼 열기 함수
    function openEditCommentForm(commentId) {
        const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
        const currentContentElem = commentItem.querySelector('.comment-content');
        const currentContent = currentContentElem.textContent;

        // 기존 내용을 담은 textarea 생성
        const editForm = document.createElement('div');
        editForm.className = 'comment-edit-form';
        editForm.innerHTML = `
            <textarea class="edit-comment-content" rows="3">${currentContent}</textarea>
            <button class="btn-comment-save">저장</button>
            <button class="btn-comment-cancel">취소</button>
        `;

        commentItem.appendChild(editForm); // 댓글 항목 아래에 폼 추가

        // 기존 내용 숨기기 및 버튼 숨기기
        currentContentElem.style.display = 'none';
        commentItem.querySelector('.comment-actions').style.display = 'none';

        const editTextArea = editForm.querySelector('.edit-comment-content');
        const saveButton = editForm.querySelector('.btn-comment-save');
        const cancelButton = editForm.querySelector('.btn-comment-cancel');

        saveButton.addEventListener('click', () => updateComment(commentId, editTextArea.value.trim()));
        cancelButton.addEventListener('click', () => closeEditCommentForm(commentItem, currentContentElem, editForm));
    }

    // 댓글 수정 폼 닫기 함수
    function closeEditCommentForm(commentItem, currentContentElem, editFormElem) {
        editFormElem.remove(); // 폼 제거
        currentContentElem.style.display = 'block'; // 기존 내용 다시 표시
        commentItem.querySelector('.comment-actions').style.display = 'block'; // 버튼 다시 표시
    }

    // 댓글 수정 함수
    async function updateComment(commentId, newContent) {
        if (!newContent) {
            alert('수정할 댓글 내용을 입력해주세요.');
            return;
        }

        try {
            const response = await authenticatedFetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '댓글 수정 실패');
            }

            alert('댓글이 성공적으로 수정되었습니다.');
            loadComments(); // 댓글 목록 새로고침

        } catch (error) {
            console.error('댓글 수정 중 오류 발생:', error);
            alert(`댓글 수정 실패: ${error.message}`);
        }
    }

    // 댓글 삭제 함수
    async function deleteComment(commentId) {
        if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await authenticatedFetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '댓글 삭제 실패');
            }

            alert('댓글이 성공적으로 삭제되었습니다.');
            loadComments(); // 댓글 목록 새로고침

        } catch (error) {
            console.error('댓글 삭제 중 오류 발생:', error);
            alert(`댓글 삭제 실패: ${error.message}`);
        }
    }

    // 페이지 로드 시 게시글 상세 및 댓글 로드
    loadPostDetail();
});