import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@context': path.resolve(__dirname, './src/context'),
      '@chrome': path.resolve(__dirname, './src/chrome'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/chrome/background/index.ts'),
        'claude-content-script': path.resolve(__dirname, 'src/chrome/content-scripts/claude-content-script.ts'),
        'openai-content-script': path.resolve(__dirname, 'src/chrome/content-scripts/openai-content-script.ts'),
        'chatgpt-content-script': path.resolve(__dirname, 'src/chrome/content-scripts/chatgpt-content-script.ts'),
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'background') return 'background.js';
          if (chunk.name === 'claude-content-script') return 'content-scripts/claude-content-script.js';
          if (chunk.name === 'openai-content-script') return 'content-scripts/openai-content-script.js';
          if (chunk.name === 'chatgpt-content-script') return 'content-scripts/chatgpt-content-script.js';
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
});
