import React from 'react';
import { usePrompts } from '@context/PromptContext';
import './prompt-detail.css';

/**
 * Prompt detail component props
 */
interface PromptDetailProps {
  id: string | null;
}

/**
 * Prompt detail component
 * Displays details of a selected prompt
 */
const PromptDetail: React.FC<PromptDetailProps> = ({ id }) => {
  const { userPrompts } = usePrompts();
  
  // Find the selected prompt
  const prompt = id ? userPrompts.find(p => p.id === id) : null;

  /**
   * Handle back button click
   */
  const handleBack = () => {
    // Dispatch event to notify content area to show prompt list
    window.dispatchEvent(new Event('backToList'));
  };

  if (!prompt) {
    return (
      <div className="prompt-detail">
        <button className="back-button" onClick={handleBack}>
          &larr; Back to Prompts
        </button>
        <div className="error-message">Prompt not found</div>
      </div>
    );
  }

  return (
    <div className="prompt-detail">
      <button className="back-button" onClick={handleBack}>
        &larr; Back to Prompts
      </button>
      
      <h2>{prompt.title}</h2>
      
      <div className="prompt-tags">
        {prompt.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className="prompt-content-box">
        <h3>Prompt Content</h3>
        <pre>{prompt.content}</pre>
      </div>
      
      <div className="prompt-variables">
        <h3>Variables</h3>
        <div className="variables-placeholder">
          {/* This would be populated with actual variables */}
          <div className="variable-item">
            <span className="variable-name">content</span>
            <input type="text" placeholder="Enter content to optimize" />
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="edit-button">Edit Prompt</button>
        <button className="use-button">Use Prompt</button>
      </div>
    </div>
  );
};

export default PromptDetail;
