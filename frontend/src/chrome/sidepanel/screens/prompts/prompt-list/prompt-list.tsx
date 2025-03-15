import React, { useState, useEffect } from 'react';
import './prompt-list.css';
import LibraryCard from '@components/ui/library-card/library-card';
import { usePrompts } from '@context/PromptContext';
import { UserPrompt } from '../../../../../types/prompt';

/**
 * Prompt list component
 * Displays a list of user prompts
 */
const PromptList: React.FC = () => {
  const { userPrompts, isLoading, error, addPrompt } = usePrompts();
  
  /**
   * Handle prompt selection
   */
  const handlePromptSelect = (id: string) => {
    // Dispatch event to notify content area to show prompt detail
    const event = new CustomEvent('itemSelect', { detail: { id } });
    window.dispatchEvent(event);
  };

  /**
   * Handle menu button click
   */
  const handleMenuClick = (id: string) => {
    // TODO: Implement menu functionality
    console.log('Menu clicked for prompt:', id);
  };

  /**
   * Handle create new prompt
   */
  const handleCreatePrompt = () => {
    // TODO: Implement create new prompt functionality
    console.log('Create new prompt');
  };

  return (
    <div className="prompt-list">
      <h2>Your Prompts</h2>
      
      {isLoading ? (
        <div className="prompts-container">
          {Array(5).fill(0).map((_, index) => (
            <LibraryCard
              key={index}
              title=""
              isLoading={true}
            />
          ))}
        </div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : userPrompts.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any prompts yet.</p>
          <button className="add-prompt-button" onClick={handleCreatePrompt}>Create New Prompt</button>
        </div>
      ) : (
        <div className="prompts-container">
          {userPrompts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(prompt => (
              <LibraryCard
                key={prompt.id}
                title={prompt.title}
                iconName="prompt-line"
                rightIconName="menu-line"
                onClick={() => handlePromptSelect(prompt.id)}
                onRightButtonClick={() => handleMenuClick(prompt.id)}
              />
            ))}
          <button className="add-prompt-button" onClick={handleCreatePrompt}>+ New Prompt</button>
        </div>
      )}
    </div>
  );
};

export default PromptList;
