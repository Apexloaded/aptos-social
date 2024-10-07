'use client';

import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from './ui/button';
import { AlertModalProps } from '@/context/modal.context';

interface AlertModalComponentProps extends AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function AlertModal({
  isOpen,
  title,
  message,
  onClose,
  onCancel,
  onConfirm,
  cancelText = onConfirm ? 'Cancel' : 'Close',
  confirmText = 'Confirm',
}: AlertModalComponentProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={handleCancel}
    >
      <div className="fixed bg-dark/50 dark:bg-white/10 backdrop-blur-sm inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white dark:bg-dark px-5 pb-5 pt-2 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            {title && (
              <DialogTitle as="h3" className="text-base/7 mt-2 font-semibold dark:text-white">
                {title}
              </DialogTitle>
            )}
            <div className="mt-2 flex flex-col">
              <p className="text-sm text-dark/80 dark:text-white/70">
                {message}
              </p>
              <div className="flex mt-2 gap-3 justify-start">
                {onConfirm && (
                  <Button
                    className="flex-shrink-0"
                    onClick={handleConfirm}
                    variant={'default'}
                  >
                    {confirmText}
                  </Button>
                )}
                <Button
                  className="flex-shrink-0"
                  variant={'secondary'}
                  onClick={handleCancel}
                >
                  {cancelText}
                </Button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
