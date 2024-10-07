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
import BackButton from '../ui/back';
import {
  ArrowLeft,
  ClipboardPenLineIcon,
  CopyCheckIcon,
  CopyIcon,
  ShareIcon,
} from 'lucide-react';
import { useAccount } from '@/context/account.context';
import { formatWalletAddress } from '@/utils/helpers';
import { QRCode } from 'react-qrcode-logo';
import useClipBoard from '@/hooks/clipboard.hook';
import useToast from '@/hooks/toast.hook';
import { Label } from '../ui/label';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { withdrawalResolver } from '@/schemas/withdraw.schema';
import ShowError from '../ui/inputerror';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useGetFungibleAssets } from '@/hooks/queries/useGetFungibleAssets';
import { ICoins } from '@/interfaces/transaction.interface';
import {
  AccountAddress,
  convertAmountFromHumanReadableToOnChain,
  convertAmountFromOnChainToHumanReadable,
} from '@aptos-labs/ts-sdk';
import { aptosClient } from '@/utils/aptosClient';

export default function WithdrawModal() {
  const {
    trigger,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ ...withdrawalResolver });
  const { address, account, connected } = useAccount();
  const [amount, setAmount] = useState<string>('0.00');
  const [receiver, setReceiver] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<ICoins>();
  const { isCopied, paste } = useClipBoard();
  const { success, loading, error } = useToast();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data } = useGetFungibleAssets({
    address,
    withPagination: false,
    enabled: connected && !!address,
  });

  useEffect(() => {
    if (isCopied) {
      success({ msg: 'Copied to clipboard' });
    }
  }, [isCopied]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const onPaste = async () => {
    const text = await paste();
    if (!text) return;
    setValue('to', text);
    trigger('to');
    setReceiver(text);
  };

  const getAmount = (amount: number, decimals: number) =>
    convertAmountFromOnChainToHumanReadable(amount, decimals);

  const setMax = () => {
    if (!selectedToken) return;
    const amount = getAmount(selectedToken.amount, selectedToken.decimals);
    setValue('amount', amount);
    setAmount(`${amount}`);
    trigger('amount');
  };

  const resetForm = () => {
    setAmount('0.00');
    reset({
      to: '',
      amount: undefined,
      token: '', // Add this line to reset the token field
    });
    setSelectedToken(undefined);
    setReceiver(undefined);
  };

  const onSubmit = async (payload: FieldValues) => {
    try {
      if (!selectedToken || !account) return;
      loading({ msg: 'Initiating transfer...' });
      const { to, amount } = payload;
      const transferTransaction = await aptosClient().transferCoinTransaction({
        sender: account.accountAddress,
        recipient: to as unknown as AccountAddress,
        amount: convertAmountFromHumanReadableToOnChain(
          amount,
          selectedToken.decimals
        ),
        coinType: selectedToken?.assetType,
      });
      const committedTxn = await aptosClient().signAndSubmitTransaction({
        signer: account,
        transaction: transferTransaction,
      });
      const pendingTxn = await aptosClient().waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      if (pendingTxn.success) {
        resetForm();
        success({
          msg: `${amount} ${selectedToken.symbol} Transferred`,
        });
        closeModal();
      }
    } catch (err: any) {
      error({ msg: err.message || 'Error initiating transfer' });
    }
  };

  return (
    <>
      <Button
        onClick={openModal}
        type="button"
        size={'sm'}
        variant={'outline'}
        className="text-dark/70 dark:text-white"
      >
        <p className="text-sm">Withdraw</p>
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto scrollbar-hide"
          onClose={openModal}
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
                  <p className="font-bold -ml-2 dark:text-white">Withdraw</p>
                </DialogTitle>
                <div className="flex flex-col gap-4 md:gap-5 px-5 pt-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    <div className="flex-1">
                      <Label
                        className="mb-1 text-dark/80 dark:text-white/70"
                        isRequired={true}
                      >
                        Token
                      </Label>
                      <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <div>
                            <Select
                              onValueChange={(ev) => {
                                let selected = data?.coins.find(
                                  (coin) => coin.assetType === ev
                                );
                                setSelectedToken(selected);
                                onChange(ev);
                              }}
                              defaultValue={value}
                            >
                              <SelectTrigger className="h-12 dark:bg-dark placeholder:text-dark/40 dark:text-white">
                                <SelectValue placeholder="Select Token" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-dark-light">
                                {data &&
                                  data.coins.map((value, index) => (
                                    <SelectItem
                                      key={index}
                                      value={value.assetType}
                                      className="dark:hover:bg-white/50 dark:text-white dark:hover:text-white"
                                    >
                                      {value.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        name={'token'}
                      />
                      {errors.token && (
                        <ShowError error={`${errors.token?.message}`} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                    <div className="flex-1">
                      <Label
                        className="mb-1 text-dark/80 dark:text-white/70"
                        isRequired={true}
                      >
                        Wallet Address
                      </Label>
                      <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <div className="flex items-center relative bg-white dark:bg-dark border border-medium/60 rounded-md overflow-hidden h-12">
                            <Input
                              type={'text'}
                              className="text-sm border-none dark:text-white outline-none"
                              placeholder="Wallet address"
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
                      />
                      {errors.to && (
                        <ShowError error={`${errors.to?.message}`} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col gap-5">
                        <div className="flex-1">
                          <Label
                            className="mb-1 text-dark/80 dark:text-white/70"
                            isRequired={true}
                          >
                            Amount
                          </Label>
                          <Controller
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <div className="flex items-center relative bg-white dark:bg-dark border border-medium/60 rounded-md overflow-hidden">
                                <Input
                                  className="bg-transparent dark:text-white text-sm h-12 outline-none border-none"
                                  placeholder="Min amount: 0.01"
                                  onChange={(e) => {
                                    onChange(e);
                                    setAmount(e.target.value);
                                  }}
                                  value={value ? value : ''}
                                />
                                {Number(selectedToken?.amount) > 0 && (
                                  <div
                                    role="button"
                                    onClick={setMax}
                                    className="flex gap-1 p-4"
                                  >
                                    <p className="text-primary text-sm font-semibold">
                                      Max
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            name={'amount'}
                          />
                          {errors.amount && (
                            <ShowError error={`${errors.amount?.message}`} />
                          )}
                          {selectedToken && (
                            <div className="flex gap-2 items-center text-primary">
                              <p className="text-sm font-semibold">Balance:</p>
                              <p className="text-sm font-semibold">
                                {selectedToken
                                  ? `${getAmount(
                                      selectedToken.amount,
                                      selectedToken.decimals
                                    )}`
                                  : '0.00'}{' '}
                                {selectedToken?.symbol}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-6">
                        {receiver && (
                          <div>
                            <p className="text-sm text-dark/60 dark:text-white truncate">
                              Your withdrawal will be processed to the wallet
                              address below.
                            </p>
                            <p className="text-primary text-sm font-bold">
                              {formatWalletAddress(
                                `${receiver}`,
                                '...',
                                10,
                                10
                              )}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between mt-2 items-center">
                          <div className="flex flex-col">
                            <p className="text-sm dark:text-white/70">
                              Amount Recieved
                            </p>
                            <div className="flex gap-1 items-center">
                              <p className="text-xl dark:text-white">
                                {amount}
                              </p>
                              <p className="text-xl dark:text-white">
                                {selectedToken?.symbol}
                              </p>
                            </div>
                            <p className="text-xs text-medium">
                              {/* Fee: 1.00 {selectedToken?.name} */}
                            </p>
                          </div>
                          <div>
                            <Button
                              type={'submit'}
                              onClick={handleSubmit(onSubmit)}
                              disabled={isSubmitting || !isValid}
                            >
                              <div className="px-4 h-8 flex items-center justify-center">
                                <p>Withdraw</p>
                              </div>
                            </Button>
                          </div>
                        </div>
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
