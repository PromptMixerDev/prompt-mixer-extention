/**
 * Данные для слайдов на странице аутентификации
 */
export interface SlideData {
  id: string;
  color: string;
  title: string;
  description: string;
}

/**
 * Данные для слайдов
 */
export const slidesData: SlideData[] = [
  { 
    id: 'slide-1', 
    color: '#ffffff',
    title: 'Prompt Mixer transforms everyone into prompt engineering experts',
    description: ''
  },
  { 
    id: 'slide-2', 
    color: '#ffffff',
    title: 'Instant enhancement',
    description: 'Type your initial prompt into the text field then click the enhance button.'
  },
  { 
    id: 'slide-3', 
    color: '#ffffff',
    title: 'Custom variables',
    description: 'Create a system of dynamic variables to maintain consistency across different prompts.'
  },
  { 
    id: 'slide-4', 
    color: '#ffffff',
    title: 'Create your library',
    description: 'Access your most-used prompts seamlessly in the AI tool you love.'
  },
  { 
    id: 'slide-5', 
    color: '#ffffff',
    title: 'Works with all AI tools',
    description: 'Prompt Mixer is already working on all the major AI platforms, and we\'re adding even more!'
  }
];

export default slidesData;
