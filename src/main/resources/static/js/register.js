document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const generalError = document.getElementById('general-error');
    const successMessage = document.getElementById('success-message');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지

        // 에러 메시지 초기화
        usernameError.textContent = '';
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        generalError.textContent = '';
        successMessage.textContent = '';

        const username = usernameInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // 클라이언트 측 유효성 검사 (기본적인 것만)
        let isValid = true;
        if (username.length < 2 || username.length > 20) {
            usernameError.textContent = '사용자 이름은 2자 이상 20자 이하여야 합니다.';
            isValid = false;
        }
        if (password.length < 2) {
            passwordError.textContent = '비밀번호는 2자 이상이어야 합니다.';
            isValid = false;
        }
        if (password !== confirmPassword) {
            confirmPasswordError.textContent = '비밀번호가 일치하지 않습니다.';
            isValid = false;
        }

        if (!isValid) {
            return; // 유효성 검사 실패 시 제출 중단
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // 성공적인 응답 (HTTP 201 Created)
                successMessage.textContent = '회원가입이 성공적으로 완료되었습니다! 3초 후 로그인 페이지로 이동합니다.';
                registerForm.reset(); // 폼 초기화
                setTimeout(() => {
                    window.location.href = '/login.html'; // 3초 후 로그인 페이지로 이동
                }, 3000);
            } else {
                // 오류 응답 처리
                const errorData = await response.json();
                if (response.status === 409) { // DuplicateUsernameException
                    generalError.textContent = errorData.message || '이미 존재하는 사용자 이름입니다.';
                } else if (response.status === 400 && errorData.errors) { // @Valid 유효성 검사 실패
                    // 필드별 에러 메시지 표시
                    for (const field in errorData.errors) {
                        if (field === 'username') {
                            usernameError.textContent = errorData.errors[field];
                        } else if (field === 'password') {
                            passwordError.textContent = errorData.errors[field];
                        }
                    }
                } else {
                    generalError.textContent = errorData.message || '회원가입 중 오류가 발생했습니다.';
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            generalError.textContent = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
        }
    });
});