'use client';

import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  CheckCheckIcon,
  CircleAlertIcon,
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
import { payUser } from '@/aptos/entry/profile.entry';
import debounce from 'debounce';
import { isNameTaken } from '@/aptos/view/profile.view';

export default function PayModal() {
  const {
    trigger,
    control,
    setValue,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ ...withdrawalResolver });
  const username = watch('to');

  const { address, account, connected, signAndSubmitTransaction } =
    useAccount();
  const [amount, setAmount] = useState<string>('0.00');
  const [receiver, setReceiver] = useState<string>();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
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

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username) {
        const res = await isNameTaken(username);
        setIsAvailable(res as boolean);
      } else {
        setIsAvailable(null);
      }
    }, 1000),
    []
  );

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const onPaste = async () => {
    const text = await paste();
    if (!text) return;
    setValue('to', text);
    trigger('to');
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
      if (!selectedToken || !account || !isAvailable) return;
      loading({ msg: 'Initiating transfer...' });
      const { to, amount } = payload;
      const txResponse = await signAndSubmitTransaction(
        payUser(
          to,
          convertAmountFromHumanReadableToOnChain(
            amount,
            selectedToken.decimals
          ),
          selectedToken.assetType
        )
      );
      if (txResponse) {
        const pendingTxn = await aptosClient().waitForTransaction({
          transactionHash: txResponse.hash,
        });
        if (pendingTxn.success) {
          resetForm();
          success({
            msg: `${amount} ${selectedToken.symbol} Paid`,
          });
          closeModal();
        }
      }
    } catch (err: any) {
      error({ msg: err.message || 'Error sending payment' });
    }
  };

  return (
    <>
      <Button
        type="button"
        size={'sm'}
        onClick={openModal}
        variant={'outline'}
        className="text-dark/70 dark:text-white"
      >
        <p className="text-sm">Pay</p>
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
                  <p className="font-bold -ml-2 dark:text-white">Pay</p>
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
                              <SelectContent className="bg-white">
                                {data &&
                                  data.coins.map((value, index) => (
                                    <SelectItem
                                      key={index}
                                      value={value.assetType}
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
                        tooltip="Aptos social username"
                        isRequired={true}
                      >
                        Username
                      </Label>
                      <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <div className="flex items-center relative bg-white dark:bg-dark dark:text-white border border-medium/60 rounded-md overflow-hidden h-12">
                            <Input
                              type={'text'}
                              className="text-sm bg-transparent dark:text-white border-none outline-none"
                              placeholder="Username"
                              onChange={(e) => {
                                onChange(e);
                                checkUsername(e.target.value);
                                setReceiver(e.target.value);
                                setIsAvailable(null);
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
                      {isAvailable == null && username?.length > 0 && (
                        <p className="text-dark/60 font dark:text-white text-sm">Checking...</p>
                      )}
                      {isAvailable == false && username?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <p className="text-danger font text-sm">
                            Username Taken
                          </p>
                          <CircleAlertIcon size={18} className="text-danger" />
                        </div>
                      )}
                      {isAvailable == true && username?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <p className="text-primary font text-sm">Available</p>
                          <CheckCheckIcon size={18} className="text-primary" />
                        </div>
                      )}
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
                              <div className="flex items-center relative bg-white dark:bg-dark dark:text-white border border-medium/60 rounded-md overflow-hidden">
                                <Input
                                  className="bg-transparent text-sm h-12 outline-none border-none"
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
                              This payment will be sent to the username{' '}
                              <span className="text-primary text-sm font-bold">
                                {receiver}
                              </span>
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
                              disabled={isSubmitting || !isAvailable || !isValid}
                            >
                              <div className="px-4 h-8 flex items-center justify-center">
                                <p>Pay</p>
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
