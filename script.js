
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
  
  setInterval(createSymbol, 100);
  
  
document.addEventListener('DOMContentLoaded', async () => {

    async function verifyToken(token) {
     try {
      const response = await fetch('https://helpertool2.teawithsuqar.workers.dev/verify-token', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ token })
      });
   
      const data = await response.json();
   
      if (!response.ok) {
       throw new Error(data.error || 'Invalid token');
      }
   
      return data;
   
     } catch (error) {
      console.error("Token verification failed:", error);
      return null;
     }
    }
   
    function updateHeader(nickname, role) {
     const navLinks = document.querySelector('.nav-links');
     let dropdownContent = `<a href="#" id="logoutBtn">Выйти</a>`;
     let buttonText = nickname;
     if (role) {
      buttonText = `${nickname} (${role})`;
      dropdownContent = `<a href="#">Роль: ${role}</a>` + dropdownContent;
     }
   
   
     navLinks.innerHTML = `
           <div class="dropdown">
               <button class="dropbtn">${buttonText}</button>
               <div class="dropdown-content">
                   ${dropdownContent}
               </div>
           </div>
       `;
   
     document.getElementById('logoutBtn').addEventListener('click', logout);
    }
    function logout() {
     localStorage.removeItem('authToken'); 
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

    if ((currentPage.endsWith('register.html') || currentPage.endsWith('login.html')) && localStorage.getItem('authToken')) {
     const authToken = localStorage.getItem('authToken');
     const userData = await verifyToken(authToken);
   
     if (userData) {
      window.location.href = 'index.html';
      return;
     } else {
      localStorage.removeItem('authToken');
      updateHeaderButtons();
      showNotification('Недействительный токен. Пожалуйста, войдите снова.', 'error');
     }
    }
   
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
     const userData = await verifyToken(authToken);
     if (userData) {
      updateHeader(userData.nickname, userData.role);
      showNotification('Добро пожаловать, ' + userData.nickname + '!', 'success');
     } else {
      localStorage.removeItem('authToken');
      updateHeaderButtons();
      showNotification('Недействительный токен. Пожалуйста, войдите снова.', 'error');
      window.location.href = 'login.html';
     }
    } else {
     updateHeaderButtons();
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
        localStorage.setItem('authToken', data.token);
        const userData = await verifyToken(data.token);
        updateHeader(userData.nickname, userData.role);
   
        showNotification('Вы успешно вошли в систему, ' + userData.nickname + '!', 'success');
        loginForm.reset();
        window.location.href = "index.html";
       } catch (error) {
        showNotification('Ошибка соединения', 'error');
        console.error(error);
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
        console.error(error);
       }
      });
     }
    }
   
    if (!document.getElementById('kurator-select')) return;
   
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
   
    const codeBtn = document.querySelector('.code-btn');
    const telegramInput = document.querySelector('input[placeholder="Цифры от бота"]');
    let cooldown = false;
   
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
      console.error(error);
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
   });
   