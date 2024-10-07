'use client';

import React, { Fragment, useState } from 'react';
import { useAccount } from '@/context/account.context';
import useToast from '@/hooks/toast.hook';
import { INFT } from '@/interfaces/feed.interface';
import { aptosClient } from '@/utils/aptosClient';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import {
  ArrowLeft,
  ClipboardPenLineIcon,
  SendHorizontalIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import ShowError from '@/components/ui/inputerror';
import { Input } from '@/components/ui/input';
import useClipBoard from '@/hooks/clipboard.hook';
import { formatWalletAddress } from '@/utils/helpers';

type Props = {
  nft: INFT;
};
export default function TransferButton({ nft }: Props) {
  const {
    trigger,
    control,
    setValue,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm();
  const { account, address } = useAccount();
  const [receiver, setReceiver] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { paste } = useClipBoard();
  const { loading, success, error } = useToast();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const onPaste = async () => {
    const text = await paste();
    if (!text) return;
    setValue('to', text);
    trigger('to');
    setReceiver(text);
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      if (!account) return;
      const { to } = data;
      loading({ msg: 'Initiating transfer...' });
      const transferTransaction =
        await aptosClient().transferDigitalAssetTransaction({
          sender: account,
          digitalAssetAddress: `${nft.current_token_data?.token_data_id}`,
          recipient: to as unknown as AccountAddress,
        });
      const committedTxn = await aptosClient().signAndSubmitTransaction({
        signer: account,
        transaction: transferTransaction,
      });
      const pendingTxn = await aptosClient().waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      if (pendingTxn.success) {
        success({
          msg: `#${nft.current_token_data?.token_name} token tranferred`,
        });
      }
    } catch (err: any) {
      error({ msg: err.message || 'Error initiating transfer' });
    }
  };

  return (
    <>
      <div
        onClick={openModal}
        role="button"
        className="py-2 px-3 hover:bg-secondary dark:hover:bg-dark dark:text-white flex items-center gap-3"
      >
        <SendHorizontalIcon size={20} />
        <p>Transfer</p>
      </div>

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
              <DialogPanel className="inline-block w-full max-w-lg max-h-svh md:max-h-[45rem] md:pb-8 md:my-8 overflow-scroll scrollbar-hide text-left align-middle transition-all transform bg-white dark:bg-dark-light md:shadow-2xl rounded-2xl">
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
                  <p className="font-bold -ml-2 dark:text-white">
                    Token #{nft.current_token_data?.token_name}
                  </p>
                </DialogTitle>
                <div className="flex flex-col gap-4 md:gap-5 px-5 pt-5">
                  <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                    <div className="flex-1">
                      <Label className="mb-1 text-dark/80 dark:text-white/70" isRequired={true}>
                        Wallet Address
                      </Label>
                      <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <div className="flex items-center relative bg-white dark:bg-dark border border-medium/60 rounded-md overflow-hidden h-12">
                            <Input
                              type={'text'}
                              className="text-sm border-none outline-none dark:text-white"
                              placeholder="Address"
                              onChange={(e) => {
                                onChange(e);
                                setReceiver(e.target.value);
                              }}
                              value={value ? value : ''}
                            />
                            <div
                              role="button"
                              onClick={onPaste}
                              className="h-full px-3 flex items-center justify-center"
                            >
                              <ClipboardPenLineIcon
                                className="text-primary"
                                size={20}
                              />
                            </div>
                          </div>
                        )}
                        name={'to'}
                        rules={{
                          required: 'Enter destination address',
                        }}
                      />
                      {errors.to && (
                        <ShowError error={`${errors.to?.message}`} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                    <div className="flex-1">
                      <Button
                        type={'submit'}
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting || !isValid}
                        className="w-full"
                      >
                        <div className="px-4 h-8 flex items-center justify-center">
                          <p>Transfer</p>
                        </div>
                      </Button>
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
