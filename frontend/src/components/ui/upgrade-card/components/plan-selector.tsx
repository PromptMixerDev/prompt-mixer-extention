import React from 'react';
import './plan-selector.css';

interface PlanSelectorProps {
  /**
   * Выбранный план (monthly или yearly)
   */
  selectedPlan: 'monthly' | 'yearly';
  
  /**
   * Callback при изменении выбранного плана
   */
  onChange: (plan: 'monthly' | 'yearly') => void;
  
  /**
   * Метка скидки для годового плана
   */
  discountLabel?: string;
  
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * Компонент для выбора плана подписки (месячный или годовой)
 */
const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onChange,
  discountLabel,
  className = ''
}) => {
  return (
    <div className={`plan-selector ${className}`}>
      <div 
        className={`plan-selector-option ${selectedPlan === 'monthly' ? 'active' : ''}`}
        onClick={() => onChange('monthly')}
      >
        Monthly
      </div>
      <div 
        className={`plan-selector-option ${selectedPlan === 'yearly' ? 'active' : ''}`}
        onClick={() => onChange('yearly')}
      >
        Yearly
        {discountLabel && <span className="plan-selector-discount">{discountLabel}</span>}
      </div>
    </div>
  );
};

export default PlanSelector;
