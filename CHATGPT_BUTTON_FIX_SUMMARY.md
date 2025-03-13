# Исправление проблем с отображением кнопки на ChatGPT

## Выявленные проблемы

1. **Проблема с отображением кнопки на разных сайтах**:
   - На openai.com кнопка отображалась круглой (стиль 'gpt')
   - На chatgpt.com кнопка отображалась квадратной (стиль 'claude')

2. **Причина проблемы**:
   - Оба инжектора (ClaudeInjector и GPTInjector) инициализировались на всех сайтах
   - ClaudeInjector создавал кнопку первым, и она отображалась с стилем 'claude' (квадратная кнопка)
   - GPTInjector находил поле ввода, но не создавал кнопку, потому что она уже существовала

3. **Дополнительная проблема**:
   - Инжекторы инициализировались дважды: один раз при импорте файла, и второй раз через `injector-factory.ts`
   - Это приводило к дублированию инжекторов и конфликтам между ними

## Внесенные изменения

### 1. Добавлена проверка типа страницы в ClaudeInjector

```typescript
public initialize(): void {
  // Check if we're on a Claude page before initializing
  if (window.location.href.includes('claude.ai') || window.location.href.includes('anthropic.com')) {
    console.log('ClaudeInjector: Detected Claude page, initializing');
    super.initialize();
    this.setupAuthListener();
  } else {
    console.log('ClaudeInjector: Not a Claude page, skipping initialization');
  }
}
```

### 2. Добавлена проверка типа страницы в GPTInjector

```typescript
public initialize(): void {
  // Check if we're on a GPT page before initializing
  if (window.location.href.includes('chat.openai.com') || 
      window.location.href.includes('chatgpt.com') || 
      window.location.href.includes('openai.com')) {
    console.log('GPTInjector: Detected GPT page, initializing');
    super.initialize();
  } else {
    console.log('GPTInjector: Not a GPT page, skipping initialization');
  }
}
```

### 3. Удален код автоматической инициализации из файлов инжекторов

В файлах `claude-injector.ts` и `gpt-injector.ts` удален код, который автоматически создавал и инициализировал инжекторы:

```typescript
// Было:
const claudeInjector = new ClaudeInjector();
claudeInjector.initialize();

// Стало:
// Инжектор будет создан и инициализирован через injector-factory.ts
```

### 4. Добавлено логирование для отладки

В `button-factory.ts` и `base-injector.ts` добавлено логирование, чтобы отслеживать, какой стиль кнопки используется на разных сайтах:

```typescript
// В button-factory.ts
const buttonStyle = options.style || 'claude';
console.log('Creating button with style:', buttonStyle, 'on URL:', window.location.href);

// В base-injector.ts
console.log(`${this.config.name} Injector: Creating button with style:`, this.config.buttonStyle, 'on URL:', window.location.href);
```

### 5. Удалены устаревшие файлы

Удалены старые файлы, которые не использовались в проекте:
- `frontend/src/chrome/content-scripts/claude-injector.ts`
- `frontend/src/chrome/content-scripts/gpt-injector.ts`
- `frontend/src/chrome/content-scripts/components/improve-button.ts`

## Результаты

1. **Правильное отображение кнопок**:
   - На сайтах Claude (claude.ai, anthropic.com) кнопка отображается с стилем 'claude' (квадратная кнопка)
   - На сайтах OpenAI (chat.openai.com, chatgpt.com, openai.com) кнопка отображается с стилем 'gpt' (круглая кнопка)

2. **Улучшенная производительность**:
   - Каждый инжектор инициализируется только на соответствующих сайтах
   - Нет дублирования кнопок или конфликтов между инжекторами
   - Инжекторы создаются только один раз через `injector-factory.ts`

3. **Улучшенная отладка**:
   - Добавлено логирование для отслеживания процесса создания кнопок
   - Легко определить, какой инжектор и с каким стилем создает кнопку на каждом сайте

## Тестирование

Для проверки внесенных изменений рекомендуется выполнить следующие тесты:

1. **Тест на chatgpt.com**:
   - Открыть chatgpt.com и проверить, что кнопка отображается круглой (стиль 'gpt')
   - Проверить в консоли, что инициализируется только GPTInjector, а ClaudeInjector пропускает инициализацию
   - Убедиться, что в логах нет дублирования инжекторов

2. **Тест на openai.com**:
   - Открыть openai.com и проверить, что кнопка отображается круглой (стиль 'gpt')
   - Проверить в консоли, что инициализируется только GPTInjector, а ClaudeInjector пропускает инициализацию
   - Убедиться, что в логах нет дублирования инжекторов

3. **Тест на claude.ai**:
   - Открыть claude.ai и проверить, что кнопка отображается квадратной (стиль 'claude')
   - Проверить в консоли, что инициализируется только ClaudeInjector, а GPTInjector пропускает инициализацию
   - Убедиться, что в логах нет дублирования инжекторов
