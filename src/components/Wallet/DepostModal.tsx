'use client';

import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Button } from '../ui/button';
import { ArrowLeft, CopyCheckIcon, CopyIcon, ShareIcon } from 'lucide-react';
import { useAccount } from '@/context/account.context';
import { QRCode } from 'react-qrcode-logo';
import useClipBoard from '@/hooks/clipboard.hook';
import useToast from '@/hooks/toast.hook';

export default function DepositModal() {
  const { address } = useAccount();
  const { copy, isCopied } = useClipBoard();
  const { success } = useToast();
  const qrCodeRef = useRef<QRCode>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isCopied) {
      success({ msg: 'Copied to clipboard' });
    }
  }, [isCopied]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const download = () => {
    if (qrCodeRef.current)
      qrCodeRef.current.download('png', 'aptos-social-wallet');
    closeModal();
  };

  return (
    <>
      <Button
        type="button"
        onClick={openModal}
        size={'sm'}
        className="border border-primary"
      >
        <p className="text-sm text-white">Deposit</p>
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto scrollbar-hide"
          onClose={closeModal}
        >
          <div className="min-h-screen bg-white md:bg-transparent md:px-4 text-center flex items-center justify-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-dark/50" />
            </TransitionChild>

            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="inline-block w-full max-w-md max-h-svh md:max-h-[45rem] md:pb-8 md:my-8 overflow-scroll scrollbar-hide text-left align-middle transition-all transform bg-white dark:bg-dark-light md:shadow-2xl rounded-2xl">
                <DialogTitle
                  as="h3"
                  className="text-lg px-4 py-2 flex top-0 sticky z-20 bg-white dark:bg-dark-light border-b border-secondary dark:border-secondary/40 justify-start items-center leading-6 m-0 text-dark/80"
                >
                  <Button
                    variant={'ghost'}
                    onClick={closeModal}
                    size="icon"
                    className={'-translate-x-3'}
                  >
                    <ArrowLeft size={23} className="dark:text-white" />
                  </Button>
                  <p className="font-bold -ml-2 dark:text-white">Deposit</p>
                </DialogTitle>
                <div className="px-5 pt-5">
                  <div className="max-w-sm mx-auto text-center flex flex-col gap-6">
                    <p className="px-5 leading-6 dark:text-white">
                      Scan the QR code or copy the wallet address to share with
                      others
                    </p>

                    <div className="flex items-center justify-center">
                      <div className="border-[6px] border-primary">
                        <QRCode
                          value={`${address}`}
                          size={180}
                          qrStyle={'squares'}
                          quietZone={5}
                          fgColor="#4cae4f"
                          bgColor="transparent"
                          ref={qrCodeRef}
                        />
                      </div>
                    </div>
                    <div className="">
                      <p className="text-base/6 text-dark/50 dark:text-white/60">
                        Your APTOS Address
                      </p>
                      {address && (
                        <p className="break-all dark:text-white">{address}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-7">
                      <div className="flex items-center flex-col">
                        <Button
                          size={'icon'}
                          onClick={() => {
                            copy(`${address}`);
                            closeModal();
                          }}
                          variant={'secondary'}
                        >
                          {isCopied ? (
                            <CopyCheckIcon size={19} className="text-primary" />
                          ) : (
                            <CopyIcon size={19} className="text-primary" />
                          )}
                        </Button>
                        <p className="text-sm dark:text-white">Copy</p>
                      </div>

                      <div className="flex items-center flex-col">
                        <Button
                          size={'icon'}
                          onClick={download}
                          variant={'secondary'}
                        >
                          <ShareIcon size={19} className="text-primary" />
                        </Button>
                        <p className="text-sm dark:text-white">Share</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
