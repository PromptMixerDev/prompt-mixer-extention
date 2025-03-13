import React from 'react';
import './history-detail.css';

/**
 * History detail component props
 */
interface HistoryDetailProps {
  id: string | null;
}

/**
 * History detail component
 * Displays details of a selected history item
 */
const HistoryDetail: React.FC<HistoryDetailProps> = ({ id }) => {
  // Mock data for history detail
  const historyDetail = {
    id: 'history-1',
    promptTitle: 'SEO Optimization',
    originalPrompt: 'Optimize this content for SEO: {{content}}',
    improvements: [
      {
        id: 'imp-1',
        timestamp: '2023-05-15T10:30:00Z',
        improvedPrompt: 'Optimize the following content for SEO, focusing on readability and keyword density: {{content}}'
      },
      {
        id: 'imp-2',
        timestamp: '2023-05-15T12:45:00Z',
        improvedPrompt: 'Analyze and optimize the following content for SEO. Improve readability, keyword density, and add meta description suggestions: {{content}}'
      },
      {
        id: 'imp-3',
        timestamp: '2023-05-15T14:30:00Z',
        improvedPrompt: 'Perform a comprehensive SEO optimization on the following content. Enhance readability, optimize keyword usage, suggest meta descriptions, and improve heading structure: {{content}}'
      }
    ]
  };

  /**
   * Handle back button click
   */
  const handleBack = () => {
    // Dispatch event to notify content area to show history list
    window.dispatchEvent(new Event('backToList'));
  };

  if (!id) {
    return (
      <div className="history-detail">
        <button onClick={handleBack}>Back to History</button>
        <p>No history item selected</p>
      </div>
    );
  }

  return (
    <div className="history-detail">
      <button onClick={handleBack}>Back to History</button>
      <h2>{historyDetail.promptTitle} - Improvement History</h2>
      
      <div>
        <h3>Original Prompt:</h3>
        <p>{historyDetail.originalPrompt}</p>
      </div>
      
      <div>
        <h3>Improvements:</h3>
        {historyDetail.improvements.map((improvement, index) => (
          <div key={improvement.id}>
            <h4>Version {index + 1} - {new Date(improvement.timestamp).toLocaleString()}</h4>
            <p>{improvement.improvedPrompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryDetail;
