import React, { useState, useEffect } from 'react';
import { usePrompts } from '@context/PromptContext';
import LibraryIcon from '@components/ui/library-icon/library-icon';
import InputBlock from '@components/ui/input-block/input-block';
import Skeleton from 'react-loading-skeleton';
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
  const { userPrompts, isLoading, error, updatePrompt } = usePrompts();
  
  // Local state for content and variables
  const [localContent, setLocalContent] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Find the selected prompt
  const prompt = id ? userPrompts.find(p => p.id === id) : null;
  
  // Ref для отслеживания предыдущих значений переменных
  const prevVariableValuesRef = React.useRef<Record<string, string>>({});
  
  // Initialize local content when prompt changes
  useEffect(() => {
    if (prompt) {
      setLocalContent(prompt.content);
    }
  }, [prompt]);

  // Initialize variable values when prompt changes
  useEffect(() => {
    if (prompt && prompt.variables) {
      const initialValues: Record<string, string> = {};
      prompt.variables.forEach(variable => {
        // Используем сохраненное значение или пустую строку
        initialValues[variable.name] = variable.value || '';
      });
      setVariableValues(initialValues);
      
      // Инициализируем предыдущие значения
      prevVariableValuesRef.current = initialValues;
    }
  }, [prompt]);


  /**
   * Handle variable value change
   */
  const handleVariableChange = (name: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обновление контента промпта при изменении
  useEffect(() => {
    const updateContent = async () => {
      if (prompt && localContent !== prompt.content) {
        try {
          await updatePrompt(prompt.id, { content: localContent });
          console.log('Prompt content updated automatically');
        } catch (error) {
          console.error('Error updating prompt content:', error);
        }
      }
    };
    
    // Здесь можно добавить debounce для предотвращения слишком частых обновлений
    const timeoutId = setTimeout(updateContent, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [localContent, prompt, updatePrompt]);
  
  // Обновление значений переменных при изменении
  useEffect(() => {
    const updateVariableValues = async () => {
      if (prompt && prompt.variables && Object.keys(variableValues).length > 0) {
        try {
          // Проверяем, действительно ли изменились значения переменных
          const hasChanges = prompt.variables.some(variable => 
            prevVariableValuesRef.current[variable.name] !== variableValues[variable.name]
          );
          
          if (!hasChanges) {
            return; // Если нет изменений, не обновляем
          }
          
          // Сохраняем текущие значения как предыдущие
          prevVariableValuesRef.current = {...variableValues};
          
          // Создаем обновленный список переменных с текущими значениями
          const updatedVariables = prompt.variables.map(variable => ({
            ...variable,
            value: variableValues[variable.name] || ''
          }));
          
          // Обновляем промпт с новыми значениями переменных
          await updatePrompt(prompt.id, { variables: updatedVariables });
          console.log('Variable values updated automatically');
        } catch (error) {
          console.error('Error updating variable values:', error);
        }
      }
    };
    
    // Добавляем debounce для предотвращения слишком частых обновлений
    const timeoutId = setTimeout(updateVariableValues, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [variableValues, prompt, updatePrompt]);

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="prompt-detail">
        <div className="prompt-detail-skeleton">
          <Skeleton height={32} width={200} /> {/* Title */}
          <div className="prompt-tags">
            <Skeleton height={24} width={60} inline={true} style={{ marginRight: 8 }} />
            <Skeleton height={24} width={80} inline={true} />
          </div>
          <div className="prompt-content-box">
            <Skeleton height={24} width={150} /> {/* Content heading */}
            <Skeleton height={120} /> {/* Content */}
          </div>
          <div className="prompt-variables">
            <Skeleton height={24} width={100} /> {/* Variables heading */}
            <Skeleton height={80} /> {/* Variables */}
          </div>
          <div className="action-buttons">
            <Skeleton height={40} width={120} inline={true} style={{ marginRight: 16 }} />
            <Skeleton height={40} width={120} inline={true} />
          </div>
        </div>
      </div>
    );
  }

  // If error or prompt not found
  if (error || !prompt) {
    return (
      <div className="prompt-detail">
        <div className="error-message">
          {error || "Prompt not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-detail">
      <div className="prompt-header">
        <LibraryIcon iconName="prompt-line" size="xlarge" />
        <div className="prompt-header-info">
          <div className="prompt-header-title">{prompt.title}</div>
          {prompt.description && (
            <div className="prompt-header-description">{prompt.description}</div>
          )}
        </div>
      </div>
      
      <div className="prompt-content-box">
        <InputBlock
          variant="prompt"
          label="Prompt"
          value={localContent}
          onChange={setLocalContent}
        />
      </div>
      
      {prompt.variables && prompt.variables.length > 0 && (
        <div className="prompt-variables">
          <div className="variables-container">
            {prompt.variables.map(variable => (
              <InputBlock
                key={variable.name}
                variant="variable"
                label={variable.name}
                value={variableValues[variable.name] || ''}
                onChange={(value) => handleVariableChange(variable.name, value)}
                placeholder={`Enter value for ${variable.name}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDetail;
