const preloader = document.querySelector('.preloader');

function createSymbol() {
    const colors = ['green', 'brown', 'stone', 'red', 'blue'];
    const particle = document.createElement('div');
    particle.className = `background-particle pixel-${colors[Math.floor(Math.random() * colors.length)]}`;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    const size = 2 + Math.random() * 6;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDelay = `${Math.random() * 1}s`;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2000);
}

function showNotification(text, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = text;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; Secure; SameSite=Strict`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

document.addEventListener('DOMContentLoaded', async () => {
    try {

        async function verifyToken(token) {
            if (!token) {
                return null;
            }

            try {
                const response = await fetch('https://helpertool2.teawithsuqar.workers.dev/verify-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Invalid token');
                }

                return data;

            } catch (error) {
                return null;
            }
        }
if (window.location.pathname.includes('applications.html')) {
    const token = getCookie('authToken');
    if (!token) window.location.href = 'login.html';
    
    verifyToken(token).then(data => {
        if (!data || data.role !== 'kurator') {
            window.location.href = 'index.html';
        }
    });
}

function updateHeader(nickname, role) {
    const navLinks = document.querySelector('.nav-links');
    let dropdownContent = `<a href="#" id="logoutBtn">Выйти</a>`;
    let buttonText = nickname;
    let curatorButtons = '';
    let downloadButton = '';

    if (role === 'kurator') {
        curatorButtons = `
            <a href="applications.html" class="nav-btn">Заявки</a>
            <a href="staff.html" class="nav-btn">Персонал</a>
        `;
    } else if (role === 'user') {
        downloadButton = `<a href="#" id="downloadBtn" class="nav-btn">Скачать HelperTool2</a>`;
    }

    if (role) {
        buttonText = `${nickname} (${role})`;
        dropdownContent = `<a href="#">Роль: ${role}</a>` + dropdownContent;
    }

    navLinks.innerHTML = `
        ${curatorButtons}
        ${downloadButton}
        <div class="dropdown">
            <button class="dropbtn">${buttonText}</button>
            <div class="dropdown-content">
                ${dropdownContent}
            </div>
        </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadLatestVersion();
        });
    }
}

        

        function logout() {
            eraseCookie('authToken');
            updateHeaderButtons();
            showNotification('Вы вышли из аккаунта', 'success');
        }

        function updateHeaderButtons() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.innerHTML = `
                <a href="register.html" class="nav-btn">Регистрация</a>
                <a href="login.html" class="nav-btn">Войти</a>
            `;
        }
        const currentPage = window.location.pathname;

        const storedToken = getCookie('authToken');

        if ((currentPage.endsWith('register.html') || currentPage.endsWith('login.html')) && storedToken) {
            const userData = await verifyToken(storedToken);

            if (userData) {
                window.location.href = 'index.html';
                return;
            } else {
                eraseCookie('authToken');
                updateHeaderButtons();
                showNotification('Недействительный токен. Пожалуйста, войдите снова.', 'error');
            }
        }


        if (storedToken) {
            const userData = await verifyToken(storedToken);
            if (userData) {
                updateHeader(userData.nickname, userData.role);
                showNotification('Добро пожаловать, ' + userData.nickname + '!', 'success');
                if (userData.role === 'user') {
                    const downloadBtn = document.getElementById('downloadBtn');
                    if (downloadBtn) {
                        downloadBtn.style.display = 'block';
                    }
                }
            } else {
                eraseCookie('authToken');
                updateHeaderButtons();
                showNotification('Недействительный токен. Пожалуйста, войдите снова.', 'error');
                window.location.href = 'login.html';
            }
        }
        


        const loginForm = document.querySelector('.auth-form');
        if (loginForm) {
            if (loginForm.querySelector('h2').textContent === 'Вход') {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const nickname = document.querySelector('input[placeholder="Никнейм"]').value.trim();
                    const password = document.querySelector('input[placeholder="Пароль"]').value.trim();

                    if (!nickname || !password) {
                        showNotification('Все поля обязательны', 'error');
                        return;
                    }

                    try {
                        const response = await fetch('https://helpertool2.teawithsuqar.workers.dev/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ nickname, password })
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            showNotification(data.error || 'Ошибка входа', 'error');
                            return;
                        }

                        setCookie('authToken', data.token, 7);

                        const userData = await verifyToken(data.token);
                        updateHeader(userData.nickname, userData.role);

                        showNotification('Вы успешно вошли в систему, ' + userData.nickname + '!', 'success');
                        loginForm.reset();
                        window.location.href = "index.html";

                    } catch (error) {
                        showNotification('Ошибка соединения', 'error');
                    }
                });
            } else if (loginForm.querySelector('h2').textContent === 'Регистрация') {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const formData = {
                        nickname: document.getElementById('nickname').value.trim(),
                        password: document.getElementById('password').value.trim(),
                        telegramId: document.getElementById('telegramId').value.trim(),
                        code: document.getElementById('code').value.trim(),
                        kuratorId: document.getElementById('kurator-select').value
                    };

                    if (!Object.values(formData).every(Boolean)) {
                        showNotification('Все поля обязательны', 'error');
                        return;
                    }

                    if (formData.nickname.length > 20) {
                        showNotification('Никнейм не должен превышать 20 символов', 'error');
                        return;
                    }
            
                    if (formData.nickname.includes(' ')) {
                        showNotification('Никнейм не должен содержать пробелы', 'error');
                        return;
                    }

                    try {
                        const nicknameCheck = await fetch(
                            'https://helpertool2.teawithsuqar.workers.dev/check-nickname',
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ nickname: formData.nickname })
                            }
                        );

                        if ((await nicknameCheck.json()).exists) {
                            showNotification('Никнейм занят', 'error');
                            return;
                        }

                        const response = await fetch(
                            'https://helpertool2.teawithsuqar.workers.dev/register',
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(formData)
                            }
                        );

                        if (!response.ok) {
                            const error = await response.json();
                            showNotification(error.error, 'error');
                            return;
                        }

                        showNotification('Регистрация успешна!', 'success');
                        document.querySelector('.auth-form').reset();

                    } catch (error) {
                        showNotification('Ошибка соединения', 'error');
                    }
                });
            }
        }
        if (document.getElementById('kurator-select')) {
            const select = document.getElementById('kurator-select');
            const form = document.querySelector('form');

            try {
                const response = await fetch('https://helpertool2.teawithsuqar.workers.dev/get-spisok');
                if (!response.ok) throw new Error('Ошибка загрузки');

                const data = await response.json();
                select.innerHTML = '';

                data.forEach(kurator => {
                    const option = new Option(kurator.NicknameKur, kurator.KurID);
                    select.add(option);
                });

                const placeholder = new Option('Выбери своего куратора', '', true, true);
                placeholder.disabled = true;
                placeholder.hidden = true;
                select.prepend(placeholder);

                form.addEventListener('submit', (e) => {
                    if (!select.value) {
                        e.preventDefault();
                        const error = document.createElement('div');
                        error.className = 'error-message';
                        error.textContent = 'Выберите куратора из списка';
                        select.parentNode.insertBefore(error, select.nextElementSibling);
                    }
                });

                select.addEventListener('change', () => {
                    document.querySelector('.error-message')?.remove();
                });

            } catch (error) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Список кураторов временно недоступен';
                form.prepend(errorMsg);
            }
        }
        const codeBtn = document.querySelector('.code-btn');
        const telegramInput = document.querySelector('input[placeholder="Цифры от бота"]');
        let cooldown = false;

        if (codeBtn && telegramInput) {
            codeBtn.addEventListener('click', async () => {
                if (cooldown) return;

                const telegramId = telegramInput.value.trim();
                if (!telegramId) {
                    showNotification('Введите цифры от бота', 'error');
                    return;
                }

                try {
                    const response = await fetch('https://helpertool2.teawithsuqar.workers.dev/check-telegram', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ telegramId })
                    });

                    const result = await response.json();

                    if (result.valid) {
                        showNotification('Код отправлен в Telegram', 'success');
                    } else if (result.error === 'invalid_bot_data') {
                        showNotification('Неверные данные из цифры от бота', 'error');
                    } else if (result.error === 'contact_developer') {
                        showNotification('Свяжитесь с разработчиком', 'warning');
                    } else {
                        showNotification('Цифры от бота недействительны', 'error');
                    }
                    if (result.error !== 'contact_developer') {
                        startCooldown();
                    }

                } catch (error) {
                    showNotification('Ошибка соединения', 'error');
                    startCooldown();
                }
            });

            function startCooldown() {
                cooldown = true;
                codeBtn.disabled = true;
                let seconds = 60;

                const interval = setInterval(() => {
                    codeBtn.textContent = `Повторить (${seconds})`;
                    seconds--;

                    if (seconds < 0) {
                        clearInterval(interval);
                        codeBtn.disabled = false;
                        codeBtn.textContent = 'Получить код';
                        cooldown = false;
                    }
                }, 1000);
            }
        }

        setInterval(createSymbol, 100);

    } catch (error) {
        showNotification('Произошла критическая ошибка', 'error');
    } finally {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.remove();
            document.body.classList.add('loaded');
        }, 500);
    }
    async function downloadLatestVersion() {
        const repoUrl = 'https://api.github.com/repos/YanderuxTea/HelperTool/releases/latest';

            const response = await fetch(repoUrl);
            const data = await response.json();
    
            if (data.assets && data.assets.length > 0) {
                const downloadUrl = data.assets[0].browser_download_url;
                window.open(downloadUrl, '_blank');
            } 
        } 
    
if (window.location.pathname.includes('applications.html')) {
    loadApplications();
}
let currentPage = 1;
const itemsPerPage = 3;
let allApplications = [];
let searchQuery = '';
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    searchQuery = e.target.value.toLowerCase();
    currentPage = 1;
    updateApplicationsDisplay();
});

document.getElementById('clearSearch')?.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    currentPage = 1;
    updateApplicationsDisplay();
});

async function loadApplications() {
    try {
        const token = getCookie('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('https://helpertool2.teawithsuqar.workers.dev/get-applications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            showNotification('Доступ только для кураторов', 'error');
            window.location.href = 'index.html';
            return;
        }

        allApplications = await response.json();
        updateApplicationsDisplay();


    } catch (error) {
        showNotification('Ошибка загрузки заявок', 'error');
    }
}

function truncateNickname(nickname) {
    if (nickname.length > 6) {
        return `${nickname.slice(0, 6)}...`;
    }
    return nickname;
}

function updateApplicationsDisplay() {
    const container = document.getElementById('applicationsList');
    container.classList.add('items-out');
    container.style.pointerEvents = 'none';

    setTimeout(() => {
        container.innerHTML = '';
        container.classList.remove('items-out');

        const filtered = allApplications.filter(app => 
            app.Nickname.toLowerCase().includes(searchQuery)
        );

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const applicationsToShow = filtered.slice(start, end);

        if (applicationsToShow.length === 0) {
            container.innerHTML = '<div class="no-applications">' + 
                (searchQuery ? 'Ничего не найдено 😞' : 'Нет активных заявок') + 
                '</div>';
            return;
        }

        applicationsToShow.forEach((app, index) => {
            const item = document.createElement('div');
            item.className = 'application-item';
            
            const originalNickname = app.Nickname;
            const displayedNickname = truncateNickname(originalNickname);
            const highlightSearchQuery = (text) => {
                if (searchQuery) {
                    return text.replace(
                        new RegExp(`(${searchQuery})`, 'gi'), 
                        '<span class="highlight">\$1</span>'
                    );
                }
                return text;
            };

            const highlightedNickname = highlightSearchQuery(displayedNickname);
            const highlightedFullNickname = highlightSearchQuery(originalNickname);

            item.innerHTML = `
                <span class="nickname" title="${originalNickname}">${highlightedNickname}</span>
                <div class="application-actions">
                    <button class="action-btn accept-btn" data-tgid="${app.Telegram_ID}">Принять</button>
                    <button class="action-btn reject-btn" data-tgid="${app.Telegram_ID}">Отклонить</button>
                </div>
            `;
            item.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(item);
            item.addEventListener('click', () => {
                item.classList.toggle('expanded');
                const nicknameElement = item.querySelector('.nickname');
                if (item.classList.contains('expanded')) {
                    nicknameElement.innerHTML = highlightedFullNickname; 
                } else {
                    nicknameElement.innerHTML = highlightedNickname; 
                }
            });
        });

        container.style.pointerEvents = 'auto';
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', handleApplicationAction);
        });

        updatePagination(filtered.length);
    }, 500);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination-container');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1 || totalItems === 0) {
        return;
    }

    paginationContainer.innerHTML = `
        <button class="pagination-btn" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>
        <span class="current-page">Страница ${currentPage} из ${totalPages}</span>
        <button class="pagination-btn" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>→</button>
    `;

    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateApplicationsDisplay();
        }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateApplicationsDisplay();
        }
    });
}

async function handleApplicationAction(e) {
    const action = e.target.classList.contains('accept-btn') ? 'accept' : 'reject';
    const telegramId = e.target.dataset.tgid;

    try {
        const response = await fetch('https://helpertool2.teawithsuqar.workers.dev/handle-application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('authToken')}`
            },
            body: JSON.stringify({ action, telegramId })
        });

        if (response.ok) {
            showNotification(`Заявка ${action === 'accept' ? 'принята' : 'отклонена'}`, 'success');
            loadApplications();
        } else {
            showNotification('Ошибка обработки заявки', 'error');
        }
        
    } catch (error) {
        showNotification('Ошибка соединения', 'error');
    }
}
});