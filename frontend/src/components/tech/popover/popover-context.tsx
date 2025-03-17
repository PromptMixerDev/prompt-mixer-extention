import React from 'react';

export interface PopoverContextValue {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const PopoverContext = React.createContext<PopoverContextValue>({
  isOpen: false,
  setIsOpen: () => {},
});

export const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopoverContext must be used within a PopoverProvider');
  }
  return context;
};
