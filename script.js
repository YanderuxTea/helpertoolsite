document.addEventListener('DOMContentLoaded', async () => {
    const preloader = document.querySelector('.preloader');

    // Проверка аутентификации
    async function checkAuth() {
        try {
            const response = await fetch('https://your-worker.workers.dev/verify-token', {
                method: 'GET',
                credentials: 'include'
            });
            
            const data = await response.json();
            return data.authenticated ? data : null;
        } catch (error) {
            console.error('Auth check failed:', error);
            return null;
        }
    }

    // Обновление хедера
    async function updateHeader() {
        const authData = await checkAuth();
        const navLinks = document.querySelector('.nav-links');

        if (authData) {
            // Показ данных пользователя
            navLinks.innerHTML = `
                ${authData.role === 'kurator' ? `
                    <a href="applications.html" class="nav-btn">Заявки</a>
                    <a href="staff.html" class="nav-btn">Персонал</a>
                ` : ''}
                <button class="nav-btn" id="logoutBtn">Выйти (${authData.nickname})</button>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', logout);
        } else {
            // Гостевое меню
            navLinks.innerHTML = `
                <a href="register.html" class="nav-btn">Регистрация</a>
                <a href="login.html" class="nav-btn">Войти</a>
            `;
        }
    }

    // Логаут
    async function logout() {
        try {
            await fetch('https://your-worker.workers.dev/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    // Обработка формы логина
    document.querySelector('.auth-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nickname = document.getElementById('nickname').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://your-worker.workers.dev/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            await updateHeader();
            window.location.href = 'index.html';

        } catch (error) {
            showNotification(error.message || 'Ошибка входа', 'error');
        }
    });

    // Инициализация
    try {
        await updateHeader();
        
        // Защита роутов
        if (window.location.pathname.includes('/secure/') && !(await checkAuth())) {
            window.location.href = '/login.html';
        }

    } catch (error) {
        console.error('Init error:', error);
    } finally {
        preloader.remove();
    }

    // Остальные функции (showNotification и т.д.)
    // ... ваш оригинальный код ...
});

// Вспомогательные функции
function showNotification(text, type) {
    // ... ваш оригинальный код ...
}
