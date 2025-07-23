document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const generalError = document.getElementById('general-error');
    const successMessage = document.getElementById('success-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 에러 메시지 초기화
        usernameError.textContent = '';
        passwordError.textContent = '';
        generalError.textContent = '';
        successMessage.textContent = '';

        const username = usernameInput.value;
        const password = passwordInput.value;

        // 클라이언트 측 유효성 검사 (간단하게)
        let isValid = true;
        if (!username) {
            usernameError.textContent = '사용자 이름을 입력해주세요.';
            isValid = false;
        }
        if (!password) {
            passwordError.textContent = '비밀번호를 입력해주세요.';
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const accessToken = data.accessToken;

                // JWT 토큰을 로컬 스토리지에 저장 (보안 상 중요한 정보이므로 실제 서비스에서는 다른 방법 고려)
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('username', username); // 사용자 이름도 저장하여 네비게이션에 표시

                successMessage.textContent = '로그인이 성공적으로 완료되었습니다! 잠시 후 메인 페이지로 이동합니다.';
                loginForm.reset();
                setTimeout(() => {
                    window.location.href = '/'; // 메인 페이지로 리다이렉트
                }, 2000); // 2초 후 이동
            } else {
                const errorData = await response.json();
                // 백엔드에서 반환하는 AuthenticationException 메시지 처리
                if (response.status === 401) { // 인증 실패 (아이디/비밀번호 불일치)
                    generalError.textContent = errorData.message || '사용자 이름 또는 비밀번호가 올바르지 않습니다.';
                } else if (response.status === 400 && errorData.errors) { // @Valid 유효성 검사 실패
                    for (const field in errorData.errors) {
                        if (field === 'username') {
                            usernameError.textContent = errorData.errors[field];
                        } else if (field === 'password') {
                            passwordError.textContent = errorData.errors[field];
                        }
                    }
                } else {
                    generalError.textContent = errorData.message || '로그인 중 오류가 발생했습니다.';
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            generalError.textContent = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
        }
    });
});