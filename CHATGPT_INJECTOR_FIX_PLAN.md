# План по исправлению проблем с инжекторами для ChatGPT

## 1. Анализ текущей ситуации

### 1.1. Выявленные проблемы
- Кнопка "Improve Prompt" не отображается на ChatGPT
- Необходимость обновления страницы Claude для активации расширения
- Не учтены разные домены для ChatGPT (chat.openai.com и chatgpt.com)

### 1.2. Текущая реализация
- Единый инжектор для ChatGPT с фиксированным селектором
- Проверка только домена chat.openai.com в фабрике инжекторов
- Отсутствие отладочной информации для диагностики проблем

## 2. План исправления

### 2.1. ✅ Расширение поддержки доменов ChatGPT
- **2.1.1.** ✅ Обновить manifest.json для включения всех поддерживаемых доменов
- **2.1.2.** ✅ Расширить логику определения типа страницы в injector-factory.ts
- **2.1.3.** ✅ Добавить отладочные логи для диагностики определения типа страницы

### 2.2. ✅ Создание специализированных инжекторов для разных версий ChatGPT
- **2.2.1.** ✅ Расширить GPTInjector для поддержки разных версий ChatGPT
- **2.2.2.** ✅ Определить правильные селекторы для каждого интерфейса
- **2.2.3.** ✅ Обновить фабрику инжекторов для создания соответствующего инжектора

### 2.3. ✅ Улучшение инициализации инжекторов
- **2.3.1.** ✅ Добавить механизм повторных попыток инициализации
- **2.3.2.** ✅ Реализовать обработку событий навигации для SPA
- **2.3.3.** ✅ Оптимизировать время загрузки контент-скрипта через run_at в manifest.json

### 2.4. ✅ Улучшение обработки ошибок
- **2.4.1.** ✅ Добавить обработку ошибок при поиске элементов
- **2.4.2.** ✅ Реализовать механизм работы без аутентификации для тестирования
- **2.4.3.** ✅ Добавить информативные сообщения об ошибках в консоль

## 3. Детальные шаги реализации

### 3.1. Обновление manifest.json
```json
"content_scripts": [
  {
    "matches": [
      "https://chat.openai.com/*", 
      "https://chatgpt.com/*", 
      "https://claude.ai/*", 
      "https://anthropic.com/*"
    ],
    "js": ["content-scripts/content-script.js"],
    "run_at": "document_end"
  }
]
```

### 3.2. Обновление injector-factory.ts
```typescript
export enum InjectorType {
  CLAUDE = 'claude',
  GPT_OPENAI = 'gpt-openai',
  GPT_CHATGPT = 'gpt-chatgpt',
  UNKNOWN = 'unknown',
}

export function detectPageType(): InjectorType {
  const url = window.location.href;
  console.log('Detecting page type for URL:', url);
  
  if (url.includes('claude.ai') || url.includes('anthropic.com')) {
    console.log('Detected Claude page');
    return InjectorType.CLAUDE;
  }
  
  if (url.includes('chat.openai.com')) {
    console.log('Detected OpenAI ChatGPT page');
    return InjectorType.GPT_OPENAI;
  }
  
  if (url.includes('chatgpt.com')) {
    console.log('Detected ChatGPT page');
    return InjectorType.GPT_CHATGPT;
  }
  
  console.log('Unknown page type');
  return InjectorType.UNKNOWN;
}

export function createInjector(): BaseInjector | null {
  const pageType = detectPageType();
  
  switch (pageType) {
    case InjectorType.CLAUDE:
      return new ClaudeInjector();
    
    case InjectorType.GPT_OPENAI:
      return new OpenAIGPTInjector();
    
    case InjectorType.GPT_CHATGPT:
      return new ChatGPTInjector();
    
    default:
      console.log('Unknown page type, no injector created');
      return null;
  }
}
```

### 3.3. Создание OpenAIGPTInjector
```typescript
const OPENAI_GPT_CONFIG: InjectorConfig = {
  name: 'OpenAI ChatGPT',
  inputSelector: 'textarea[data-id="root"]',
  buttonStyle: 'gpt',
  buttonPosition: 'relative',
};

export class OpenAIGPTInjector extends BaseInjector {
  constructor(config: Partial<InjectorConfig> = {}) {
    super({
      ...OPENAI_GPT_CONFIG,
      ...config,
    });
  }
  
  // Специфичная реализация для OpenAI ChatGPT
}
```

### 3.4. Создание ChatGPTInjector
```typescript
const CHATGPT_CONFIG: InjectorConfig = {
  name: 'ChatGPT',
  inputSelector: 'textarea.chatgpt-textarea', // Требуется уточнение
  buttonStyle: 'gpt',
  buttonPosition: 'relative',
};

export class ChatGPTInjector extends BaseInjector {
  constructor(config: Partial<InjectorConfig> = {}) {
    super({
      ...CHATGPT_CONFIG,
      ...config,
    });
  }
  
  // Специфичная реализация для ChatGPT
}
```

### 3.5. Улучшение BaseInjector
```typescript
public initialize(): void {
  console.log(`${this.config.name} Injector: Initializing`);
  
  // Проверка аутентификации
  this.checkAuth();
  
  // Добавление обработчика событий навигации
  this.setupNavigationHandler();
  
  // Периодическая проверка DOM
  this.setupPeriodicCheck();
}

private setupNavigationHandler(): void {
  const handleNavigation = () => {
    setTimeout(() => {
      this.findInputAndAddButton();
    }, 1000);
  };
  
  // Отслеживание изменений URL
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      handleNavigation();
    }
  }).observe(document, {subtree: true, childList: true});
  
  // Также обрабатываем события popstate
  window.addEventListener('popstate', handleNavigation);
}

private setupPeriodicCheck(): void {
  // Периодическая проверка наличия поля ввода
  setInterval(() => {
    const inputField = this.findInputField();
    if (inputField && !document.getElementById('improve-prompt-button')) {
      this.addButtonToPage(inputField);
    }
  }, 5000); // Проверка каждые 5 секунд
}
```

## 4. Тестирование

### 4.1. Тестирование на Claude
- Открыть Claude и проверить, что кнопка появляется без необходимости обновления страницы
- Проверить, что кнопка правильно позиционируется
- Проверить, что кнопка реагирует на изменения в поле ввода

### 4.2. Тестирование на chat.openai.com
- Открыть chat.openai.com и проверить, что кнопка появляется
- Проверить, что кнопка правильно позиционируется
- Проверить, что кнопка реагирует на изменения в поле ввода

### 4.3. Тестирование на chatgpt.com
- Открыть chatgpt.com и проверить, что кнопка появляется
- Проверить, что кнопка правильно позиционируется
- Проверить, что кнопка реагирует на изменения в поле ввода

## 5. Критерии успеха
- Кнопка "Improve Prompt" отображается на всех поддерживаемых сайтах
- Нет необходимости обновлять страницу для активации расширения
- Кнопка правильно позиционируется и реагирует на изменения в поле ввода
- В консоли нет ошибок, связанных с инжекторами

## 6. Временные рамки
- **День 1:** ✅ Обновление manifest.json и injector-factory.ts
- **День 2:** ✅ Создание специализированных инжекторов и определение селекторов
- **День 3:** ✅ Улучшение инициализации инжекторов и обработки ошибок
- **День 4:** Тестирование и отладка

## 7. Выполненные задачи

### 7.1. Обновление manifest.json
- ✅ Добавлены новые домены в matches и host_permissions
- ✅ Добавлен параметр run_at: "document_end" для оптимизации загрузки

### 7.2. Улучшение инжекторов
- ✅ Обновлен BaseInjector для остановки периодической проверки после добавления кнопки
- ✅ Улучшен GPTInjector с более надежным поиском элементов и позиционированием
- ✅ Обновлены стили кнопки для лучшего соответствия дизайну ChatGPT
- ✅ Унифицирован подход к обнаружению элементов DOM для всех инжекторов
- ✅ Добавлена поддержка для chatgpt.com с учетом особенностей его интерфейса

### 7.3. Улучшение обработки ошибок
- ✅ Добавлены дополнительные логи для отладки
- ✅ Реализован механизм работы без аутентификации для тестирования
- ✅ Улучшена обработка ошибок при поиске элементов

### 7.4. Унификация кода
- ✅ Удалена периодическая проверка каждые 5 секунд в пользу единого подхода с MutationObserver
- ✅ Перенесена логика из ClaudeInjector в BaseInjector для использования во всех инжекторах
- ✅ Удалено дублирование кода между инжекторами

### 7.5. Исправление проблем с аутентификацией
- ✅ Восстановлена проверка аутентификации (bypassAuth = false)
- ✅ Кнопка теперь показывается только залогиненным пользователям
- ✅ Добавлены дополнительные логи для отслеживания статуса аутентификации

Этот план позволил нам систематически решить проблемы с инжекторами для ChatGPT и улучшить общую стабильность расширения. Теперь кнопка должна корректно отображаться на всех поддерживаемых сайтах и иметь правильный стиль и позиционирование.
