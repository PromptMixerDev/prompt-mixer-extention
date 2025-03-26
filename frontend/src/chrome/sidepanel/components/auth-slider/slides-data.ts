/**
 * Данные для слайдов на странице аутентификации
 */
export interface SlideData {
  id: string;
  color: string;
  title: string;
  description: string;
  illustration?: string; // Путь к иллюстрации
}

// Импортируем изображение для слайдов
import Slide1Image from '@assets/slides/slide-1.jpg';
import Slide2Image from '@assets/slides/slide-2.jpg';
import Slide3Image from '@assets/slides/slide-3.jpg';
import Slide4Image from '@assets/slides/slide-4.jpg';
import Slide5Image from '@assets/slides/slide-5.jpg';

/**
 * Данные для слайдов
 */
export const slidesData: SlideData[] = [
  { 
    id: 'slide-1', 
    color: '#ffffff',
    title: 'Prompt Mixer<br>transforms everyone into<br>prompt engineering experts',
    description: '',
    illustration: Slide1Image
  },
  { 
    id: 'slide-2', 
    color: '#ffffff',
    title: 'Instant enhancement',
    description: 'Type your initial prompt into the text field then click the enhance button.',
    illustration: Slide2Image
  },
  { 
    id: 'slide-3', 
    color: '#ffffff',
    title: 'Custom variables',
    description: 'Create a system of dynamic variables to maintain consistency across different prompts.',
    illustration: Slide3Image
  },
  { 
    id: 'slide-4', 
    color: '#ffffff',
    title: 'Create your library',
    description: 'Access your most-used prompts seamlessly in the AI tool you love.',
    illustration: Slide4Image
  },
  { 
    id: 'slide-5', 
    color: '#ffffff',
    title: 'Works with all AI tools',
    description: 'Prompt Mixer is already working on all the major AI platforms, and we\'re adding even more!',
    illustration: Slide5Image
  }
];

export default slidesData;
