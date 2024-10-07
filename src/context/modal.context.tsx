'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertModal } from '@/components/AlertModal';

export interface AlertModalProps {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertModalContextType {
  openModal: (props: AlertModalProps) => void;
  closeModal: () => void;
}

const AlertModalContext = createContext<AlertModalContextType | undefined>(
  undefined
);

export const useAlertModal = () => {
  const context = useContext(AlertModalContext);
  if (!context) {
    throw new Error('useAlertModal must be used within an AlertModalProvider');
  }
  return context;
};

export const AlertModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<AlertModalProps | null>(null);

  const openModal = (props: AlertModalProps) => {
    setModalProps(props);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalProps(null);
  };

  return (
    <AlertModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <AlertModal isOpen={isOpen} {...modalProps} onClose={closeModal} />
    </AlertModalContext.Provider>
  );
};
