import React, { useState, useEffect } from 'react';
import './prompt-list.css';
import LibraryCard from '@components/ui/library-card/library-card';
import Button from '@components/ui/button/button';
import { Tooltip } from '@components/tech/tooltip/tooltip';
import { usePrompts } from '@context/PromptContext';
import { UserPrompt } from '../../../../../types/prompt';
import EmptyState from '@components/ui/empty-state/empty-state';
import { toast } from '@components/tech/toast/toast';
import { useSubscription } from '@hooks/useSubscription';

/**
 * Prompt list component
 * Displays a list of user prompts
 */
const PromptList: React.FC = () => {
  const { userPrompts, isLoading, error, addPrompt, deletePrompt, loadPrompts } = usePrompts();
  const { hasReachedPromptsLimit } = useSubscription();
  const [activePopupId, setActivePopupId] = useState<string | null>(null);
  
  // Логируем состояние и принудительно загружаем промпты, если они не загружены
  useEffect(() => {
    console.log('PromptList: Initial state', {
      userPromptsCount: userPrompts.length,
      isLoading,
      error
    });
    
    // Если данные не загружаются и не загружены, принудительно загружаем их
    if (!isLoading && userPrompts.length === 0 && !error) {
      console.log('PromptList: Forcing loadPrompts');
      loadPrompts(true);
    }
  }, [isLoading, userPrompts.length, error, loadPrompts]);
  
  /**
   * Handle prompt selection
   */
  const handlePromptSelect = (id: string) => {
    // Dispatch event to notify content area to show prompt detail
    const event = new CustomEvent('itemSelect', { detail: { id } });
    window.dispatchEvent(event);
  };

  /**
   * Handle menu button click (Edit prompt)
   */
  const handleMenuClick = (id: string) => {
    // Переход к редактированию промпта (то же самое, что и при клике на карточку)
    handlePromptSelect(id);
  };

  /**
   * Handle remove prompt
   */
  const handleRemovePrompt = async (id: string) => {
    try {
      await deletePrompt(id);
      // Показываем уведомление об успешном удалении
      toast.success('Prompt successfully removed');
      // Успешное удаление, обновление не требуется, так как состояние обновляется в контексте
    } catch (error) {
      console.error('Error removing prompt:', error);
      // Показываем уведомление об ошибке
      toast.error('Error on deleting a prompt');
    }
  };

  /**
   * Handle create new prompt
   */
  const handleCreatePrompt = () => {
    // Dispatch event to notify content area to show new prompt detail
    const event = new CustomEvent('itemSelect', { detail: { id: 'new' } });
    window.dispatchEvent(event);
  };

  return (
    <div className="prompt-list">
      <div className="header-container">
        <h2>My library</h2>
        <Tooltip 
          content={hasReachedPromptsLimit 
            ? "You've reached your 10 prompt limit." 
            : "Create new prompt"
          } 
          position="bottom-right"
        >
          <Button 
            kind="glyph" 
            variant="tertiary" 
            icon="add-large-line" 
            size="medium"
            onClick={handleCreatePrompt}
            className="new-prompt-button"
            aria-label="Create new prompt"
            disabled={hasReachedPromptsLimit}
          />
        </Tooltip>
      </div>
      
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
        <EmptyState 
          onButtonClick={handleCreatePrompt}
        />
      ) : (
        <div className="prompts-container">
          {userPrompts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(prompt => (
              <LibraryCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                iconName="prompt-line"
                iconId={prompt.iconId}
                colorId={prompt.colorId}
                rightIconName="more-line"
                onClick={() => handlePromptSelect(prompt.id)}
                onRightButtonClick={(id) => handleMenuClick(id || prompt.id)}
                onRemove={(id) => handleRemovePrompt(id || prompt.id)}
                isPopupActive={activePopupId === prompt.id}
                onPopupOpenChange={(isOpen) => {
                  if (isOpen) {
                    setActivePopupId(prompt.id);
                  } else if (activePopupId === prompt.id) {
                    setActivePopupId(null);
                  }
                }}
                onMouseEnter={() => {
                  // Если есть активный попап и это не текущий элемент, закрываем его
                  if (activePopupId !== null && activePopupId !== prompt.id) {
                    setActivePopupId(null);
                  }
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default PromptList;
