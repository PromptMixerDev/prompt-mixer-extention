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
    background-color: #6b46fe;
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
  
  // Добавляем SVG иконку (временная иконка, будет заменена на предоставленную пользователем)
  button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/>
  </svg>`;
  
  // Добавляем обработчик клика
  button.addEventListener('click', () => {
    const promptText = getPromptText();
    if (!promptText.trim()) {
      alert('Please enter a prompt first');
      return;
    }
    
    // Меняем иконку на анимированную
    button.innerHTML = `<svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
    </svg>`;
    
    // Добавляем стиль для анимации
    const styleId = 'improve-button-spinner-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    button.disabled = true;
    
    // Отправляем сообщение в background script
    chrome.runtime.sendMessage(
      {
        type: 'IMPROVE_PROMPT',
        data: { prompt: promptText }
      },
      (response) => {
        if (response && response.type === 'IMPROVED_PROMPT') {
          // Обновляем текст в поле ввода
          setPromptText(response.data.improvedPrompt);
          
          // Возвращаем исходную иконку
          button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/>
          </svg>`;
          button.disabled = false;
        } else {
          // Обрабатываем ошибку
          button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
          </svg>`;
          setTimeout(() => {
            button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/>
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
  console.log('Text is empty:', isEmpty, 'Text:', JSON.stringify(promptText)); // Для отладки
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
