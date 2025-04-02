import React, { ReactNode, useState } from 'react';
import PlanSelector from './components/plan-selector';
import Button from '@components/ui/button/button';
import './upgrade-card.css';

interface UpgradeCardProps {
  /**
   * Содержимое карточки
   */
  children?: ReactNode;
  
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * Компонент карточки для апгрейда
 */
const UpgradeCard: React.FC<UpgradeCardProps> = ({ 
  children,
  className = ''
}) => {
  // Константы для конфигурации цен и скидок
  const MONTHLY_PRICE = 15; // $20 в месяц
  const YEARLY_DISCOUNT = 30; // 30% скидка на годовой план
  
  // Расчет цен и скидок
  const yearlyPricePerMonth = MONTHLY_PRICE * (1 - YEARLY_DISCOUNT / 100);
  
  // Форматирование цен для отображения
  const formattedMonthlyPrice = `$${MONTHLY_PRICE}`;
  const formattedYearlyPricePerMonth = `$${Math.round(yearlyPricePerMonth)}`;
  
  // Метка скидки для годового плана
  const discountLabel = `-${YEARLY_DISCOUNT}%`;
  
  // URL для Stripe Checkout
  const monthlyCheckoutUrl = 'https://buy.stripe.com/00gdT8gcN0mm6QwcMT';
  const yearlyCheckoutUrl = 'https://buy.stripe.com/bIYbL0bWx0mm8YEfZ4';
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  
  // Определяем путь к видео в зависимости от контекста (расширение или веб)
  const videoPath = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL 
    ? chrome.runtime.getURL('assets/logo-animation.mp4')
    : '/assets/logo-animation.mp4';
    
  // Определяем цену и период в зависимости от выбранного плана
  const price = selectedPlan === 'monthly' ? formattedMonthlyPrice : formattedYearlyPricePerMonth;
  const period = selectedPlan === 'monthly' ? 'per month,\nbilled monthly' : 'per month,\nbilled yearly';
  
  // Определяем URL для Stripe Checkout
  const checkoutUrl = selectedPlan === 'monthly' ? monthlyCheckoutUrl : yearlyCheckoutUrl;
  
  // Функция для обработки клика по кнопке
  const handleSubscribeClick = () => {
    window.open(checkoutUrl, '_blank');
  };
  
  return (
    <div className={`upgrade-card ${className}`}>
      <div className="upgrade-card-header">
        <div className="upgrade-card-header-label">Switch to Pro account</div>
        <h2 className="upgrade-card-header-title">Unlock unlimited improvements of your prompts</h2>
      </div>
      <div className="upgrade-card-selector">
        <PlanSelector 
          selectedPlan={selectedPlan}
          onChange={setSelectedPlan}
          discountLabel={discountLabel}
        />
      </div>
      <div className="upgrade-card-image">
        <video 
          src={videoPath}
          autoPlay
          loop
          muted
          playsInline
          className="upgrade-card-video"
        />
      </div>
      <div className="upgrade-card-features">
        <ul className="upgrade-card-features-list">
          <li>Unlimited Prompt Enhancements</li>
          <li>Unlimited Variables</li>
          <li>Unlimited Prompt Library</li>
          <li>Priority Support</li>
        </ul>
      </div>
      <div className="upgrade-card-subcstibe">
        <div className="upgrade-card-subcstibe-left">
          <Button 
            variant="candy" 
            size="large"
            onClick={handleSubscribeClick}
            className="upgrade-card-button"
          >
            Subscribe Now
          </Button>
        </div>
        <div className="upgrade-card-subcstibe-right">
          <div className="upgrade-card-price">
            {price}
          </div>
          <div className="upgrade-card-price-period">{period}</div>
        </div>
      </div>
      <div className="upgrade-card-notes">
        The standard VAT rate may be changed, following the law of your country
      </div>
    </div>
  );
};

export default UpgradeCard;
