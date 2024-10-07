'use client';

import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';
import NewPostForm from './NewPostForm';

export function MintPost() {
  const [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button onClick={open} size="lg" className="w-full font-bold">
        Tell a Story
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed bg-dark/50 dark:bg-white/10 backdrop-blur-sm inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-xl rounded-xl bg-white dark:bg-dark px-5 pb-5 pt-2 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <DialogTitle as="h3" className="text-base/7 font-medium">
                <Button onClick={close} size="icon" variant={'ghost'}>
                  <XIcon size={18} />
                </Button>
              </DialogTitle>
              <div className="mt-2 flex items-start space-x-3">
                <NewPostForm close={close} />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
