import React, { useState, useEffect, useRef } from 'react';
import { usePrompts } from '@context/PromptContext';
import LibraryIcon from '@components/ui/library-icon/library-icon';
import InputBlock from '@components/ui/input-block/input-block';
import Skeleton from 'react-loading-skeleton';
import { IconSelectorPopup } from '@components/ui/popups/icon-selector-popup/icon-selector-popup';
import { defaultIconId, defaultColorId, getRandomIconId, getRandomColorId } from '@components/ui/library-icon/icon-options';
import chatService from '@services/chat';
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
  
  // State for icon and color
  const [localIconId, setLocalIconId] = useState<string>(defaultIconId);
  const [localColorId, setLocalColorId] = useState<string>(defaultColorId);
  
  // State for tracking new prompt creation
  const [isNewPrompt, setIsNewPrompt] = useState(false);
  const [isPromptCreated, setIsPromptCreated] = useState(false);
  
  // Icon and color selection handler
  const handleIconSelect = (iconId: string, colorId: string) => {
    try {
      // Update local state
      setLocalIconId(iconId);
      setLocalColorId(colorId);
      
      // If this is an existing prompt, save changes
      if (prompt) {
        // Create an object with update data
        const updateData = { iconId, colorId };
        
        // Call the update function
        updatePrompt(prompt.id, updateData)
          .catch(error => {
            console.error('Error updating icon and color:', error);
          });
      }
    } catch (error) {
      console.error('Error selecting icon and color:', error);
    }
  };
  
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
  
  // Function for automatic textarea height adjustment
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
          description: localDescription || undefined,
          iconId: localIconId,
          colorId: localColorId
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
      setLocalIconId(getRandomIconId());
      setLocalColorId(getRandomColorId());
    } else {
      setIsNewPrompt(false);
      if (prompt) {
        setLocalContent(prompt.content);
        setLocalTitle(prompt.title);
        setLocalDescription(prompt.description || '');
        setLocalIconId(prompt.iconId || defaultIconId);
        setLocalColorId(prompt.colorId || defaultColorId);
      }
    }
  }, [id, prompt]);
  
  // Effect for automatic textarea height adjustment when title changes
  useEffect(() => {
    if (titleTextareaRef.current) {
      autoResizeTextarea(titleTextareaRef.current);
    }
  }, [localTitle]);
  
  // Effect for automatic textarea height adjustment when description changes
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
        // Use saved value or empty string
        initialValues[variable.name] = variable.value || '';
      });
      setVariableValues(initialValues);
      
      // Initialize previous values
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
  
  // Common effect for creating a new prompt or updating an existing one
  useEffect(() => {
    const createOrUpdatePrompt = async () => {
      // For a new prompt - create only once when any field changes
      if (isNewPrompt && !isPromptCreated && (localTitle || localContent)) {
        await createNewPromptIfNeeded();
        return; // Exit to avoid executing updates below
      } 
      
      // For an existing prompt - update changed fields
      if (prompt) {
        // Update title if changed
        if (localTitle !== prompt.title) {
          try {
            await updatePrompt(prompt.id, { title: localTitle });
          } catch (error) {
            console.error('Error updating prompt title:', error);
          }
        }
        
        // Update description if changed
        if (localDescription !== (prompt.description || '')) {
          try {
            await updatePrompt(prompt.id, { description: localDescription });
          } catch (error) {
            console.error('Error updating prompt description:', error);
          }
        }
        
        // Update content if changed
        if (localContent !== prompt.content) {
          try {
            await updatePrompt(prompt.id, { content: localContent });
          } catch (error) {
            console.error('Error updating prompt content:', error);
          }
        }
      }
    };
    
    // Use debounce to prevent too frequent updates
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
  
  // Update variable values when changed
  useEffect(() => {
    const updateVariableValues = async () => {
      if (prompt && prompt.variables && Object.keys(variableValues).length > 0) {
        try {
          // Check if variable values have actually changed
          const hasChanges = prompt.variables.some(variable => 
            prevVariableValuesRef.current[variable.name] !== variableValues[variable.name]
          );
          
          if (!hasChanges) {
            return; // If no changes, don't update
          }
          
          // Save current values as previous
          prevVariableValuesRef.current = {...variableValues};
          
          // Create an updated list of variables with current values
          const updatedVariables = prompt.variables.map(variable => ({
            ...variable,
            value: variableValues[variable.name] || ''
          }));
          
          // Update prompt with new variable values
          await updatePrompt(prompt.id, { variables: updatedVariables });
        } catch (error) {
          console.error('Error updating variable values:', error);
        }
      }
    };
    
    // Add debounce to prevent too frequent updates
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
          <IconSelectorPopup
            trigger={
              <LibraryIcon 
                key={`${localIconId}-${localColorId}`}
                size="xlarge" 
                iconId={localIconId}
                colorId={localColorId}
                editable={true}
              />
            }
            currentIconId={localIconId}
            currentColorId={localColorId}
            onSelect={handleIconSelect}
          />
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
            onRightButtonClick={() => chatService.processAndAddToChat(localContent, variableValues)}
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
        <IconSelectorPopup
          trigger={
            <LibraryIcon 
              key={`${localIconId}-${localColorId}`}
              size="xlarge" 
              iconId={localIconId}
              colorId={localColorId}
              editable={true}
            />
          }
          currentIconId={localIconId}
          currentColorId={localColorId}
          onSelect={handleIconSelect}
        />
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
          onRightButtonClick={() => chatService.processAndAddToChat(localContent, variableValues)}
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
