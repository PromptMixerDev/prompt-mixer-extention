/**
 * Content script для внедрения кнопки "Improve Prompt" на страницы Claude
 * 
 * Этот скрипт добавляет кнопку рядом с полем ввода в Claude, которая позволяет
 * пользователям отправлять свой промпт на улучшение.
 */

import { createImproveButton, positionButton } from './components/improve-button';

// Оборачиваем все в IIFE, чтобы избежать загрязнения глобального пространства имен
(function() {
  console.log('Claude Injector: Initializing');
  
  // Функция для поиска поля ввода
  function findInputField(): Element | null {
    return document.querySelector('.ProseMirror') || 
           document.querySelector('[contenteditable="true"]') ||
           document.querySelector('div[role="textbox"]');
  }
  
  // Функция для добавления кнопки
  function addButton(): void {
    // Находим поле ввода
    const inputField = findInputField();
    if (!inputField) {
      console.log('Input field not found, will retry later');
      setTimeout(addButton, 1000);
      return;
    }
    
    // Проверяем, не добавили ли мы уже кнопку
    if (document.getElementById('improve-prompt-button')) {
      return;
    }
    
    // Создаем функции для получения и установки текста промпта
    const getPromptText = () => inputField.textContent || '';
    const setPromptText = (text: string) => {
      inputField.innerHTML = '';
      const textNode = document.createTextNode(text);
      inputField.appendChild(textNode);
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
    };
    
    // Создаем кнопку с помощью импортированной функции
    const buttonContainer = createImproveButton(getPromptText, setPromptText);
    
    // Находим родительский элемент поля ввода
    const fieldset = inputField.closest('fieldset');
    if (fieldset) {
      // Добавляем контейнер с кнопкой в fieldset
      fieldset.style.position = 'relative'; // Для корректного позиционирования
      fieldset.appendChild(buttonContainer);
      console.log('Improve Prompt button added to fieldset');
    } else {
      // Если не нашли fieldset, добавляем кнопку в body с фиксированным позиционированием
      buttonContainer.style.position = 'fixed';
      buttonContainer.style.top = '150px';
      buttonContainer.style.right = '20px';
      document.body.appendChild(buttonContainer);
      console.log('Improve Prompt button added to body');
    }
    
    // Позиционируем кнопку относительно поля ввода
    positionButton(inputField, buttonContainer);
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
      positionButton(inputField, buttonContainer);
    });
  }
  
  // Запускаем добавление кнопки
  addButton();
  
  // На случай, если DOM меняется динамически
  const observer = new MutationObserver(() => {
    if (!document.getElementById('improve-prompt-button')) {
      addButton();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Устанавливаем таймаут для отключения наблюдателя через 30 секунд
  setTimeout(() => {
    observer.disconnect();
    console.log('Mutation observer disconnected after timeout');
  }, 30000);
})();
