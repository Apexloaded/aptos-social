'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  CheckCheckIcon,
  CircleAlertIcon,
  Edit2Icon,
  ImageIcon,
} from 'lucide-react';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import debounce from 'debounce';
import useToast from '@/hooks/toast.hook';
import { welcomeResolver } from '@/schemas/welcome.schema';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from '../ui/button';
import ShowError from '../ui/inputerror';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import FileSelector from '../ui/fileselector';
import MediaPreview from '../Posts/MediaPreview';
import { isNameTaken } from '@/aptos/view/profile.view';
import { aptosClient } from '@/utils/aptosClient';
import { routes } from '@/routes';
import { completeOnboarding } from '@/actions/auth.action';
import { registerCreator } from '@/aptos/entry/profile.entry';
import { useAccount } from '@/context/account.context';
import { Path } from '@/config/session.enum';
import ShortUniqueId from 'short-unique-id';
import Image from 'next/image';
import { PinResponse } from 'pinata-web3';
import { IPFS_URL, DEFAULT_COLLECTION } from '@/config/constants';
import { renameFile } from '@/utils/helpers';
import { createCollection } from '@/aptos/entry/feeds.entry';
import {
  Account,
  InputGenerateTransactionPayloadData,
} from '@aptos-labs/ts-sdk';
import { uploadFile } from '@/actions/pinata.action';

function Welcome() {
  const aptosWallet = useWallet();
  const mediaRef = useRef<HTMLInputElement>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const router = useRouter();
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm(welcomeResolver);

  const username = watch('username');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { error, success, loading, updateLoading } = useToast();
  const {
    account,
    signAndSubmitTransaction,
    address,
    signAndSubmitBatchTransaction,
  } = useAccount();

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username) {
        const res = await isNameTaken(username);
        setIsAvailable(!res as boolean);
      } else {
        setIsAvailable(null);
      }
    }, 1000),
    []
  );

  const toggleMedia = () => {
    if (mediaRef.current) mediaRef.current.click();
  };

  const removeMedia = () => {
    reset({ pfp: undefined });
    setMediaFile(null);
    if (mediaRef.current) mediaRef.current.value = '';
  };

  const mintName = async () => {
    try {
      if (!account) return;
      loading({ msg: 'Processing...' });
      const name = 'aptsocial';
      const name1Owner = await aptosClient().getOwnerAddress({ name });
      console.log(name1Owner?.toString());
      success({
        msg: 'Committed transaction successfully' + name1Owner?.toString(),
      });
      const txn = await aptosClient().registerName({
        sender: account,
        name: name,
        expiration: {
          policy: 'domain',
        },
      });
      const res = await aptosClient().signAndSubmitTransaction({
        signer: account,
        transaction: txn,
      });

      const committedTransactionResponse =
        await aptosClient().waitForTransaction({ transactionHash: res.hash });

      if (committedTransactionResponse.success) {
        success({ msg: 'Committed transaction successfully' });
        /**
         * We can now query the name we just registered.
         */
        const name1Owner = await aptosClient().getOwnerAddress({ name });
        console.log(name1Owner?.toString());
      }
    } catch (err: any) {
      error({ msg: err.message || 'Error minting name' });
    }
  };

  const proceed = async (data: FieldValues) => {
    try {
      if (!mediaFile || !address) return;
      loading({ msg: 'Processing...' });

      const file = renameFile(mediaFile);
      const formData = new FormData();
      formData.append('file', file);

      updateLoading({ msg: 'Uploading profile image...' });
      const fileRes = await uploadFile(formData);
      if (!fileRes.status) {
        return error({ msg: fileRes.message || 'Error uploading file' });
      }
      const { IpfsHash } = fileRes.data as PinResponse;
      const pfpUrl = `https://${IpfsHash}.${IPFS_URL}`;

      updateLoading({ msg: 'Creating profile...' });
      const registerTx = registerCreator({
        name: data.name,
        email: data.email,
        username: data.username,
        pfp: pfpUrl,
      }).data;
      const collectionUrl = `https://${DEFAULT_COLLECTION}.${IPFS_URL}`;
      const createColTx = createCollection({
        name: 'Aptos Social Feeds',
        description: 'This is the default collection for aptos social feeds',
        max_supply: 100000,
        custom_id: `${address}-social-feeds`,
        royalty_percentage: 1,
        logo_img: `${collectionUrl}/logo.png`,
        banner_img: `${collectionUrl}/banner.jpg`,
        featured_img: `${collectionUrl}/feature.jpg`,
      }).data;

      await signAndSubmitBatchTransaction([registerTx, createColTx]);

      await completeOnboarding(`${account?.accountAddress.toString()}`);
      success({ msg: 'Profile was successfully created' });
      router.push(routes.app.home);
    } catch (err: any) {
      console.log(err);
      // const msg = getError(err);
      error({ msg: `Error creating profile` });
    }
  };

  return (
    <>
      <Controller
        control={control}
        render={({ field: { onChange } }) => (
          <>
            <FileSelector
              onSelect={(ev) => {
                if (ev.target.files) {
                  const file = ev.target.files[0];
                  setMediaFile(file);
                  console.log(file);
                  setValue('pfp', file);
                  onChange(file);
                }
              }}
              ref={mediaRef}
              accept="image/png, image/jpeg"
            />
            <div
              onClick={toggleMedia}
              role="button"
              className="h-24 w-24 bg-slate-200 hover:bg-slate-200/60 shadow-md relative rounded-2xl -mt-10 mb-2 flex items-center justify-center"
            >
              {mediaFile ? (
                <MediaPreview file={mediaFile} onClear={removeMedia} />
              ) : (
                <ImageIcon size={30} className="text-dark/50" />
              )}
              <div className="bg-white absolute -bottom-2 h-7 w-7 flex items-center shadow-md justify-center rounded-full -right-2">
                <div className="flex items-center justify-center rounded-full border border-dark/60 h-6 w-6">
                  <Edit2Icon size={14} className="text-dark/60" />
                </div>
              </div>
            </div>
            {errors.pfp && <ShowError error={errors.pfp.message} />}
          </>
        )}
        name={'pfp'}
      />
      <div className="text-center mb-4">
        <p className="text-xl font-bold dark:text-white">Setup your account</p>
        <p className="text-dark/60 text-base dark:text-white/70">
          Fill in the following information to configure and mint your
          Aptos.Social onchain profile.
        </p>
      </div>
      <div className="flex flex-col w-full border border-medium/30 gap-4 bg-white rounded-xl p-5">
        <Controller
          control={control}
          render={({ field: { onChange } }) => (
            <div>
              <Label className="mb-1 text-dark/80">Display Name</Label>
              <Input
                name="name"
                className="shadow-sm rounded-md border border-medium/30 h-11"
                placeholder="John Doe"
                onChange={onChange}
              />
              {errors.name && <ShowError error={errors.name.message} />}
            </div>
          )}
          name={'name'}
        />
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <div>
              <Label className="mb-1 text-dark/80">Username</Label>
              <Input
                name="username"
                className="shadow-sm rounded-md border border-medium/30 h-11"
                placeholder="@james"
                onChange={(e) => {
                  onChange(e);
                  checkUsername(e.target.value);
                  setIsAvailable(null);
                }}
              />
              {isAvailable == null && username?.length > 0 && (
                <p className="text-dark/60 font text-sm">Checking...</p>
              )}
              {isAvailable == false && username?.length > 0 && (
                <div className="flex items-center gap-1">
                  <p className="text-danger font text-sm">Username Taken</p>
                  <CircleAlertIcon size={18} className="text-danger" />
                </div>
              )}
              {isAvailable == true && username?.length > 0 && (
                <div className="flex items-center gap-1">
                  <p className="text-primary font text-sm">Available</p>
                  <CheckCheckIcon size={18} className="text-primary" />
                </div>
              )}
              {errors.username && <ShowError error={errors.username.message} />}
            </div>
          )}
          name={'username'}
        />
        <Controller
          control={control}
          render={({ field: { onChange } }) => (
            <div>
              <Label className="mb-1 text-dark/80">Email Address</Label>
              <Input
                name="email"
                type="email"
                className="shadow-sm rounded-md border border-medium/30 h-11"
                placeholder="email@example.com"
                onChange={onChange}
              />
              {errors.email && <ShowError error={errors.email.message} />}
            </div>
          )}
          name={'email'}
        />

        <div className="flex flex-col gap-5 mt-5">
          <Button
            onClick={handleSubmit(proceed)}
            type="submit"
            disabled={isSubmitting || !isValid}
          >
            Mint Profile
          </Button>
        </div>
      </div>
    </>
  );
}

export default Welcome;
