import React from 'react';
import { usePrompts } from '@context/PromptContext';
import './marketplace.css';

/**
 * Marketplace component
 * Displays shared prompts organized by categories
 */
const Marketplace: React.FC = () => {
  const { sharedPrompts, copySharedPrompt, isLoading } = usePrompts();

  // Mock categories
  const categories = [
    'SEO',
    'Content Writing',
    'Programming',
    'Marketing',
    'Education'
  ];

  /**
   * Handle copy prompt
   */
  const handleCopyPrompt = async (id: string) => {
    try {
      await copySharedPrompt(id);
      alert('Prompt copied to your library');
    } catch (error) {
      console.error('Error copying prompt:', error);
      alert('Failed to copy prompt');
    }
  };

  if (isLoading) {
    return <div className="marketplace">Loading marketplace...</div>;
  }

  return (
    <div className="marketplace">
      <h2>Prompt Marketplace</h2>
      
      <div className="categories">
        <h3>Categories</h3>
        <div className="category-list">
          {categories.map(category => (
            <div key={category} className="category-item">
              {category}
            </div>
          ))}
        </div>
      </div>
      
      <div className="shared-prompts">
        <h3>Featured Prompts</h3>
        {sharedPrompts.map(prompt => (
          <div key={prompt.id} className="shared-prompt-item">
            <h4>{prompt.title}</h4>
            <p>{prompt.content.substring(0, 100)}...</p>
            <div className="prompt-tags">
              {prompt.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <button onClick={() => handleCopyPrompt(prompt.id)}>
              Copy to My Prompts
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
