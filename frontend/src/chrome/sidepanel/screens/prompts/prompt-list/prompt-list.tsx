import React from 'react';
import { usePrompts } from '@context/PromptContext';
import './prompt-list.css';

/**
 * Prompt list component
 * Displays a list of user prompts
 */
const PromptList: React.FC = () => {
  const { userPrompts, isLoading } = usePrompts();

  /**
   * Handle prompt selection
   */
  const handlePromptSelect = (id: string) => {
    // Dispatch event to notify content area to show prompt detail
    const event = new CustomEvent('itemSelect', { detail: { id } });
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return <div className="loading">Loading prompts...</div>;
  }

  return (
    <div className="prompt-list">
      <h2>Your Prompts</h2>
      
      {userPrompts.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any prompts yet.</p>
          <button className="add-prompt-button">Create New Prompt</button>
        </div>
      ) : (
        <div className="prompts-container">
          {userPrompts.map(prompt => (
            <div 
              key={prompt.id} 
              className="prompt-item"
              onClick={() => handlePromptSelect(prompt.id)}
            >
              <h3>{prompt.title}</h3>
              <p className="prompt-content">{prompt.content.substring(0, 100)}...</p>
              <div className="prompt-tags">
                {prompt.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
          <button className="add-prompt-button">+ New Prompt</button>
        </div>
      )}
    </div>
  );
};

export default PromptList;
