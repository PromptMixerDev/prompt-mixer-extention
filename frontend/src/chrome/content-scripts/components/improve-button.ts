/**
 * Компонент кнопки для улучшения промпта в Claude
 */

// Функция для создания кнопки улучшения промпта
export function createImproveButton(
  getPromptText: () => string,
  setPromptText: (text: string) => void
): HTMLElement {
  // Создаем контейнер для кнопки
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'improve-prompt-button-container';
  buttonContainer.style.cssText = `
    position: absolute;
    top: 48px;
    right: 10px;
    z-index: 9999;
    display: none; /* Изначально скрываем кнопку */
  `;
  
  // Создаем кнопку с иконкой
  const button = document.createElement('button');
  button.id = 'improve-prompt-button';
  button.setAttribute('title', 'Improve Prompt'); // Тултип
  button.style.cssText = `
    background-color:rgb(0, 0, 0);
    color: white;
    border: none;
    border-radius: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 9999;
    transition: background-color 0.3s;
  `;
  
  // Добавляем SVG иконку
  button.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_102_2005)">
<path d="M12.7505 0.90625L13.7396 2.76087L15.5942 3.75L13.7396 4.73913L12.7505 6.59375L11.7613 4.73913L9.90675 3.75L11.7613 2.76087L12.7505 0.90625ZM6.00049 3.25L8.00048 7L11.7505 8.99999L8.00048 11L6.00049 14.75L4.00049 11L0.250488 8.99999L4.00049 7L6.00049 3.25ZM14.7505 12.25L13.5005 9.90629L12.2505 12.25L9.90675 13.5L12.2505 14.75L13.5005 17.0938L14.7505 14.75L17.0942 13.5L14.7505 12.25Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_102_2005">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;
  
  // Добавляем обработчик клика
  button.addEventListener('click', () => {
    const promptText = getPromptText();
    if (!promptText.trim()) {
      alert('Please enter a prompt first');
      return;
    }
    
    // Меняем иконку на анимированную
    button.innerHTML = `<svg class="spinner" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.773 4.22703L12.7123 5.28769C11.7622 4.33763 10.4497 3.75 9 3.75C6.10051 3.75 3.75 6.10051 3.75 9C3.75 11.8995 6.10051 14.25 9 14.25C11.8995 14.25 14.25 11.8995 14.25 9H15.75C15.75 12.728 12.728 15.75 9 15.75C5.27208 15.75 2.25 12.728 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C10.864 2.25 12.5515 3.00552 13.773 4.22703Z" fill="white"/>
</svg>`;
    
    // Добавляем стиль для анимации
    const styleId = 'improve-button-animation-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner {
          animation: spin 1.5s linear infinite;
          transform-origin: center;
        }
      `;
      document.head.appendChild(style);
    }
    
    button.disabled = true;
    
    // Отправляем сообщение в background script
    chrome.runtime.sendMessage(
      {
        type: 'IMPROVE_PROMPT',
        data: { 
          prompt: promptText,
          url: window.location.href // Добавляем URL текущей страницы
        }
      },
      (response) => {
        if (response && response.type === 'IMPROVED_PROMPT') {
          // Обновляем текст в поле ввода
          setPromptText(response.data.improvedPrompt);
          
          // Возвращаем исходную иконку
          button.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_102_2005)">
<path d="M12.7505 0.90625L13.7396 2.76087L15.5942 3.75L13.7396 4.73913L12.7505 6.59375L11.7613 4.73913L9.90675 3.75L11.7613 2.76087L12.7505 0.90625ZM6.00049 3.25L8.00048 7L11.7505 8.99999L8.00048 11L6.00049 14.75L4.00049 11L0.250488 8.99999L4.00049 7L6.00049 3.25ZM14.7505 12.25L13.5005 9.90629L12.2505 12.25L9.90675 13.5L12.2505 14.75L13.5005 17.0938L14.7505 14.75L17.0942 13.5L14.7505 12.25Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_102_2005">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;
          button.disabled = false;
        } else {
          // Обрабатываем ошибку
          button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
          </svg>`;
          setTimeout(() => {
            button.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_102_2005)">
<path d="M12.7505 0.90625L13.7396 2.76087L15.5942 3.75L13.7396 4.73913L12.7505 6.59375L11.7613 4.73913L9.90675 3.75L11.7613 2.76087L12.7505 0.90625ZM6.00049 3.25L8.00048 7L11.7505 8.99999L8.00048 11L6.00049 14.75L4.00049 11L0.250488 8.99999L4.00049 7L6.00049 3.25ZM14.7505 12.25L13.5005 9.90629L12.2505 12.25L9.90675 13.5L12.2505 14.75L13.5005 17.0938L14.7505 14.75L17.0942 13.5L14.7505 12.25Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_102_2005">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;
            button.disabled = false;
          }, 2000);
        }
      }
    );
  });
  
  // Добавляем кнопку в контейнер
  buttonContainer.appendChild(button);
  
  return buttonContainer;
}

// Функция для обновления видимости кнопки в зависимости от наличия текста
export function updateButtonVisibility(
  buttonContainer: HTMLElement,
  getPromptText: () => string
): void {
  const promptText = getPromptText();
  const isEmpty = !promptText || promptText.trim() === '';
  buttonContainer.style.display = isEmpty ? 'none' : 'block';
}

// Функция для позиционирования кнопки относительно поля ввода
export function positionButton(inputField: Element, buttonContainer: HTMLElement): void {
  if (!inputField || !buttonContainer) return;
  
  // Получаем размеры и позицию поля ввода
  const rect = inputField.getBoundingClientRect();
  
  // Если кнопка в fieldset (position: absolute)
  if (buttonContainer.style.position === 'absolute') {
    buttonContainer.style.top = '48px';
    buttonContainer.style.right = '10px';
  } 
  // Если кнопка в body (position: fixed)
  else {
    buttonContainer.style.top = (rect.top + 10) + 'px';
    buttonContainer.style.right = '20px';
  }
}
