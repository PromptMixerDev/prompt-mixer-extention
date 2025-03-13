import React from 'react';
import './history-list.css';

/**
 * History list component
 * Displays a list of prompt improvement history
 */
const HistoryList: React.FC = () => {
  // Mock data for history items
  const historyItems = [
    {
      id: 'history-1',
      promptTitle: 'SEO Optimization',
      timestamp: '2023-05-15T14:30:00Z',
      improvementCount: 3
    },
    {
      id: 'history-2',
      promptTitle: 'Code Review',
      timestamp: '2023-05-14T10:15:00Z',
      improvementCount: 2
    }
  ];

  /**
   * Handle history item selection
   */
  const handleHistorySelect = (id: string) => {
    // Dispatch event to notify content area to show history detail
    const event = new CustomEvent('itemSelect', { detail: { id } });
    window.dispatchEvent(event);
  };

  return (
    <div className="history-list">
      <h2>Improvement History</h2>
      
      {historyItems.length === 0 ? (
        <div className="empty-state">
          <p>No improvement history yet.</p>
        </div>
      ) : (
        <div className="history-items">
          {historyItems.map(item => (
            <div 
              key={item.id} 
              className="history-item"
              onClick={() => handleHistorySelect(item.id)}
            >
              <h3>{item.promptTitle}</h3>
              <p>Improvements: {item.improvementCount}</p>
              <p>Last updated: {new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
