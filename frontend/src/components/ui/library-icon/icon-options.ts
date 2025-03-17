/**
 * Метаданные для иконок и цветов, используемых в компоненте LibraryIcon
 */

// Импортируем все SVG иконки
import aliensFillSvg from '@assets/icons/fill/aliens-fill.svg?raw';
import armchairFillSvg from '@assets/icons/fill/armchair-fill.svg?raw';
import bearSmileFillSvg from '@assets/icons/fill/bear-smile-fill.svg?raw';
import emotionHappyFillSvg from '@assets/icons/fill/emotion-happy-fill.svg?raw';
import lightbulbFillSvg from '@assets/icons/fill/lightbulb-fill.svg?raw';
import serviceBellFillSvg from '@assets/icons/fill/service-bell-fill.svg?raw';
import settingsFillSvg from '@assets/icons/fill/settings-fill.svg?raw';

// Импортируем общие иконки
import baseIconSvg from '@assets/icons/general/base-icon.svg?raw';
import promptLineSvg from '@assets/icons/general/prompt-line.svg?raw';
import historyLineSvg from '@assets/icons/general/history-line.svg?raw';
import searchLineSvg from '@assets/icons/general/search-line.svg?raw';
import menuLineSvg from '@assets/icons/general/menu-line.svg?raw';

// Доступные цвета из токенов
export const availableColors = [
  {
    id: 'slate',
    name: 'Slate',
    value: 'var(--color-prompt-tile-slate)'
  },
  {
    id: 'silver',
    name: 'Silver',
    value: 'var(--color-prompt-tile-silver)'
  },
  {
    id: 'cooper',
    name: 'Cooper',
    value: 'var(--color-prompt-tile-cooper)'
  },
  {
    id: 'amber',
    name: 'Amber',
    value: 'var(--color-prompt-tile-amber)'
  },
  {
    id: 'tangerine',
    name: 'Tangerine',
    value: 'var(--color-prompt-tile-tangerine)'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    value: 'var(--color-prompt-tile-emerald)'
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    value: 'var(--color-prompt-tile-cobalt)'
  },
  {
    id: 'violet',
    name: 'Violet',
    value: 'var(--color-prompt-tile-violet)'
  },
  {
    id: 'magenta',
    name: 'Magenta',
    value: 'var(--color-prompt-tile-magenta)'
  },
  {
    id: 'crimson',
    name: 'Crimson',
    value: 'var(--color-prompt-tile-crimson)'
  }
];

// Объект с общими иконками
export const generalIcons = {
  'base-icon': baseIconSvg,
  'prompt-line': promptLineSvg,
  'history-line': historyLineSvg,
  'search-line': searchLineSvg,
  'menu-line': menuLineSvg,
};

// Доступные иконки
export const availableIcons = [
  {
    id: 'aliens-fill',
    name: 'Aliens',
    path: 'fill/aliens-fill',
    svg: aliensFillSvg
  },
  {
    id: 'armchair-fill',
    name: 'Armchair',
    path: 'fill/armchair-fill',
    svg: armchairFillSvg
  },
  {
    id: 'bear-smile-fill',
    name: 'Bear Smile',
    path: 'fill/bear-smile-fill',
    svg: bearSmileFillSvg
  },
  {
    id: 'emotion-happy-fill',
    name: 'Happy Face',
    path: 'fill/emotion-happy-fill',
    svg: emotionHappyFillSvg
  },
  {
    id: 'lightbulb-fill',
    name: 'Lightbulb',
    path: 'fill/lightbulb-fill',
    svg: lightbulbFillSvg
  },
  {
    id: 'service-bell-fill',
    name: 'Service Bell',
    path: 'fill/service-bell-fill',
    svg: serviceBellFillSvg
  },
  {
    id: 'settings-fill',
    name: 'Settings',
    path: 'fill/settings-fill',
    svg: settingsFillSvg
  },
  // Можно добавить больше иконок при необходимости
];

// Значения по умолчанию
export const defaultColorId = 'cobalt';
export const defaultIconId = 'lightbulb-fill';

// Интерфейсы для типизации
export interface IconOption {
  id: string;
  name: string;
  path: string;
  svg: string;
}

export interface ColorOption {
  id: string;
  name: string;
  value: string;
}

// Вспомогательные функции
export const getColorById = (id: string): ColorOption | undefined => {
  const color = availableColors.find(color => color.id === id);
  
  if (color) {
    return color;
  }
  
  return availableColors.find(color => color.id === defaultColorId);
};

export const getIconById = (id: string): IconOption | undefined => {
  const icon = availableIcons.find(icon => icon.id === id);
  
  if (icon) {
    return icon;
  }
  
  return availableIcons.find(icon => icon.id === defaultIconId);
};

/**
 * Получить случайный ID иконки из доступных
 */
export const getRandomIconId = (): string => {
  const randomIndex = Math.floor(Math.random() * availableIcons.length);
  return availableIcons[randomIndex].id;
};

/**
 * Получить случайный ID цвета из доступных
 */
export const getRandomColorId = (): string => {
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex].id;
};
