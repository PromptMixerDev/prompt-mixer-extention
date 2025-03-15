import React, { useState, useEffect, useRef } from 'react';
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
  const { userPrompts, isLoading, error, updatePrompt, addPrompt } = usePrompts();
  
  // Local state for content, title, description and variables
  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // State for tracking new prompt creation
  const [isNewPrompt, setIsNewPrompt] = useState(false);
  const [isPromptCreated, setIsPromptCreated] = useState(false);
  
  // Find the selected prompt
  const prompt = id && id !== 'new' ? userPrompts.find(p => p.id === id) : null;
  
  /**
   * Generate a name for untitled prompts
   */
  const getUntitledPromptName = () => {
    const untitledPrompts = userPrompts.filter(p => p.title.startsWith('Untitled prompt'));
    if (untitledPrompts.length === 0) return 'Untitled prompt';
    
    // Find the maximum number
    let maxNumber = 1;
    untitledPrompts.forEach(p => {
      const match = p.title.match(/Untitled prompt (\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num >= maxNumber) maxNumber = num + 1;
      } else {
        // If there's an "Untitled prompt" without a number, we'll need at least "Untitled prompt 2"
        maxNumber = Math.max(maxNumber, 2);
      }
    });
    
    return maxNumber === 1 ? 'Untitled prompt' : `Untitled prompt ${maxNumber}`;
  };
  
  // Refs
  const prevVariableValuesRef = React.useRef<Record<string, string>>({});
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Функция для автоматического изменения высоты textarea
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };
  
  /**
   * Create a new prompt if needed
   */
  const createNewPromptIfNeeded = async () => {
    if (isNewPrompt && !isPromptCreated && (localTitle || localContent)) {
      try {
        // Generate default title if user didn't enter one
        const title = localTitle || getUntitledPromptName();
        
        // Create new prompt
        const newPrompt = await addPrompt({
          title,
          content: localContent,
          description: localDescription || undefined
        });
        
        // Update state
        setIsPromptCreated(true);
        setIsNewPrompt(false);
        
        // Update URL and ID
        const event = new CustomEvent('itemSelect', { detail: { id: newPrompt.id } });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error creating new prompt:', error);
      }
    }
  };
  
  // Initialize state when id changes
  useEffect(() => {
    if (id === 'new') {
      setIsNewPrompt(true);
      setIsPromptCreated(false);
      setLocalTitle('');
      setLocalContent('');
      setLocalDescription('');
      setVariableValues({});
    } else {
      setIsNewPrompt(false);
      if (prompt) {
        setLocalContent(prompt.content);
        setLocalTitle(prompt.title);
        setLocalDescription(prompt.description || '');
      }
    }
  }, [id, prompt]);
  
  // Эффект для автоматического изменения высоты textarea при изменении заголовка
  useEffect(() => {
    if (titleTextareaRef.current) {
      autoResizeTextarea(titleTextareaRef.current);
    }
  }, [localTitle]);
  
  // Эффект для автоматического изменения высоты textarea при изменении описания
  useEffect(() => {
    if (descriptionTextareaRef.current) {
      autoResizeTextarea(descriptionTextareaRef.current);
    }
  }, [localDescription]);

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
  
  // Общий эффект для создания нового промпта или обновления существующего
  useEffect(() => {
    const createOrUpdatePrompt = async () => {
      // Для нового промпта - создаем только один раз при изменении любого поля
      if (isNewPrompt && !isPromptCreated && (localTitle || localContent)) {
        await createNewPromptIfNeeded();
        return; // Выходим, чтобы не выполнять обновления ниже
      } 
      
      // Для существующего промпта - обновляем измененные поля
      if (prompt) {
        // Обновляем заголовок если изменился
        if (localTitle !== prompt.title) {
          try {
            await updatePrompt(prompt.id, { title: localTitle });
          } catch (error) {
            console.error('Error updating prompt title:', error);
          }
        }
        
        // Обновляем описание если изменилось
        if (localDescription !== (prompt.description || '')) {
          try {
            await updatePrompt(prompt.id, { description: localDescription });
          } catch (error) {
            console.error('Error updating prompt description:', error);
          }
        }
        
        // Обновляем контент если изменился
        if (localContent !== prompt.content) {
          try {
            await updatePrompt(prompt.id, { content: localContent });
          } catch (error) {
            console.error('Error updating prompt content:', error);
          }
        }
      }
    };
    
    // Используем debounce для предотвращения слишком частых обновлений
    const timeoutId = setTimeout(createOrUpdatePrompt, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [
    localTitle, 
    localDescription, 
    localContent, 
    prompt, 
    updatePrompt, 
    isNewPrompt, 
    isPromptCreated, 
    createNewPromptIfNeeded
  ]);
  
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

  // If it's a new prompt, show empty form
  if (id === 'new' || isNewPrompt) {
    return (
      <div className="prompt-detail">
        <div className="prompt-header">
          <LibraryIcon iconName="prompt-line" size="xlarge" />
          <div className="prompt-header-info">
            <textarea
              ref={titleTextareaRef}
              className="prompt-header-title editable"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Untitled prompt"
              rows={1}
              style={{ 
                resize: 'none', 
                overflow: 'hidden',
                border: 'none',
                background: 'transparent'
              }}
            />
            <textarea
              ref={descriptionTextareaRef}
              className="prompt-header-description editable"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder="Add description..."
              rows={1}
              style={{ 
                resize: 'none', 
                overflow: 'hidden',
                border: 'none',
                background: 'transparent'
              }}
            />
          </div>
        </div>
        
        <div className="prompt-content-box">
          <InputBlock
            variant="prompt"
            label="Prompt"
            value={localContent}
            onChange={setLocalContent}
            autoFocus={false}
          />
        </div>
      </div>
    );
  }
  
  // If error or prompt not found (and not a new prompt)
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
          <textarea
            ref={titleTextareaRef}
            className="prompt-header-title editable"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Untitled prompt"
            rows={1}
            style={{ 
              resize: 'none', 
              overflow: 'hidden',
              border: 'none',
              background: 'transparent'
            }}
          />
          <textarea
            ref={descriptionTextareaRef}
            className="prompt-header-description editable"
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            placeholder="Add description..."
            rows={1}
            style={{ 
              resize: 'none', 
              overflow: 'hidden',
              border: 'none',
              background: 'transparent'
            }}
          />
        </div>
      </div>
      
      <div className="prompt-content-box">
        <InputBlock
          variant="prompt"
          label="Prompt"
          value={localContent}
          onChange={setLocalContent}
          autoFocus={false}
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
                autoFocus={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDetail;
