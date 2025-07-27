document.addEventListener('DOMContentLoaded', () => {
    const authLinksContainer = document.getElementById('auth-links');
    const writePostLink = document.getElementById('write-post-link');
    const accessToken = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username'); // 로그인 시 사용자 이름도 저장했다고 가정

    if (accessToken && username) {
        // 로그인 상태
        authLinksContainer.innerHTML = `
            <span>환영합니다, <strong>${username}</strong>님!</span>
            <a href="#" id="logout-button">로그아웃</a>
        `;
        writePostLink.style.display = 'block'; // 로그인하면 글쓰기 버튼 보이게
    } else {
        // 로그아웃 상태 또는 토큰 없음
        authLinksContainer.innerHTML = `
            <a href="/register.html">회원가입</a>
            <a href="/login.html">로그인</a>
        `;
        writePostLink.style.display = 'none'; // 로그아웃하면 글쓰기 버튼 숨기기
    }

    // 로그아웃 버튼 이벤트 리스너 추가 (동적으로 생성되므로 여기에 추가)
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username'); // 사용자 이름도 삭제
            alert('로그아웃 되었습니다.');
            window.location.href = '/'; // 메인 페이지로 리다이렉트
        });
    }
});

// fetch 요청 시 JWT 토큰을 헤더에 추가하는 함수
async function authenticatedFetch(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // 기존 헤더가 있으면 병합
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers: headers,
    });

    // 토큰 만료 등 401 Unauthorized 에러 처리
    if (response.status === 401) {
        alert('세션이 만료되었거나 인증되지 않았습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
        throw new Error('Unauthorized'); // 에러 발생시켜 이후 코드 실행 중지
    }

    return response;
}

