'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { CameraIcon, ImageIcon } from 'lucide-react';
import FileSelector from '../ui/fileselector';
import ShowError from '../ui/inputerror';
import MediaPreview from '../Posts/MediaPreview';
import { Input } from '../ui/input';
import { IPFS_URL } from '@/config/constants';
import { TextArea } from '../ui/textarea';
import { Label } from '../ui/label';
import { aptosClient } from '@/utils/aptosClient';
import useToast from '@/hooks/toast.hook';
import { routes } from '@/routes';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/context/account.context';
import { IUploadFilesResponse } from '@/interfaces/response.interface';
import { amountToApt, APT_DECIMALS, renameFile } from '@/utils/helpers';
import { uploadFiles } from '@/actions/pinata.action';
import Switch from '../ui/switch';
import { createCommunity } from '@/aptos/entry/community';
import { addCommunityResolver } from '@/schemas/community.schema';
import * as secp256k1 from '@noble/secp256k1';
import { generateCommunityHash } from '@/actions/community.action';

export default function CreateCommunity() {
  const router = useRouter();

  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const { signAndSubmitTransaction } = useAccount();
  const { error, success, loading, updateLoading } = useToast();

  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const { account } = useAccount();

  const {
    control,
    trigger,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading, isDirty },
  } = useForm({ ...addCommunityResolver });

  const generateKeyPair = async () => {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey);
    return { privateKey, publicKey };
  };

  const onSubmit = async (data: FieldValues) => {
    loading({ msg: 'Processing...' });

    try {
      const formData = new FormData();
      const files = initRenameFiles([data.logo, data.banner]);

      files.forEach((file) => formData.append('files', file));

      updateLoading({ msg: 'Uploading community images...' });

      const {
        status,
        data: fileUploadData,
        message,
      } = await uploadFiles(formData);
      if (!status) return error({ msg: message || 'Error uploading files' });

      const { pinned, metadata } = fileUploadData as IUploadFilesResponse;
      const pfpUrl = `https://${pinned.IpfsHash}.${IPFS_URL}`;

      const logo_img = `${pfpUrl}/${
        metadata.find((m) => m.id == files[0].name)?.fileName
      }`;
      const banner_img = `${pfpUrl}/${
        metadata.find((m) => m.id == files[1].name)?.fileName
      }`;

      updateLoading({ msg: 'Creating community...' });
      const { name, is_paid, entry_fee, description } = data;
      const uid = await generateCommunityHash();
      const response = await signAndSubmitTransaction(
        createCommunity({
          name,
          communityHash: uid,
          description,
          entry_fee: amountToApt(Number(entry_fee ?? 0), APT_DECIMALS),
          is_paid,
          is_messageable: true,
          logo: logo_img,
          banner: banner_img,
        })
      );

      if (response) {
        // Wait for the transaction to be commited to chain
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        // Once the transaction has been successfully commited to chain, navigate to the `my-assets` page
        if (committedTransactionResponse.success) {
          success({ msg: 'Community was successfully created' });
          router.push(`${routes.app.community.index}?tab=owned`);
        }
      }
    } catch (err: any) {
      console.log(err);
      error({ msg: err.message || 'Error creating community' });
      throw new Error(err.message || `Error creating community`);
    }
  };

  const initRenameFiles = (files: File[]): File[] => {
    const newNames = ['logo', 'banner'];
    return files.map((file, index) => {
      if (index < newNames.length) {
        return renameFile(file, newNames[index]);
      }
      return file;
    });
  };

  return (
    <div className="bg-white dark:bg-dark">
      <div className="px-5 pb-5">
        <h1 className="font-bold text-4xl pt-6 text-gray-800 dark:text-gray-100">
          Create Community
        </h1>
        <p className="mt-1 text-gray-800 dark:text-gray-400 text-md">
          Build your own Community and lead the next wave of decentralized
          innovation
        </p>
        <div className="mt-5">
          <div className="dark:text-gray-100 text-gray-800 text-sm">
            Fields are marked <span className="text-red-500">*</span> are
            required
          </div>
          <div className="mt-2">
            <p className="font-bold dark:text-gray-100 text-gray-800">
              Collection icon<span className="text-red-500">*</span>
            </p>
            <p className="text-gray-800 dark:text-gray-400 text-sm">
              This cion will appear in your community
            </p>
            <div className="h-36 overflow-hidden relative border-4 mt-1 border-dotted flex items-center justify-center w-36 border-dark dark:border-white rounded-full dark:bg-dark-light bg-white">
              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <>
                    <Button
                      type={'button'}
                      size="icon"
                      onClick={() => {
                        if (logoRef.current) logoRef.current.click();
                      }}
                      className="bg-dark/10 hover:bg-dark/20 hover:dark:bg-dark/30 h-36 w-36 z-10"
                    >
                      <CameraIcon
                        className={`text-dark dark:text-white`}
                        size={35}
                      />
                    </Button>
                    <FileSelector
                      onSelect={async (ev) => {
                        if (ev.target.files) {
                          const file = ev.target.files[0];
                          onChange(file);
                          const isValid = await trigger('logo');
                          if (isValid) setLogoImage(file);
                        }
                      }}
                      ref={logoRef}
                      accept="image/png, image/jpeg, image/gif, image/jpg"
                    />
                  </>
                )}
                name="logo"
              />
              {logoImage && (
                <div className="absolute h-full w-full rounded-full z-0">
                  <MediaPreview file={logoImage} isRounded={false} />
                </div>
              )}
            </div>
            {errors.logo && <ShowError error={errors.logo.message} />}
          </div>
          <div className="mt-7">
            <p className="font-bold dark:text-gray-100 text-gray-800">
              Banner Image
            </p>
            <p className="text-gray-800 dark:text-gray-400 text-sm">
              This image will appear as a banner in your community
            </p>
            <div className="h-52 relative overflow-hidden max-w-xl border-4 mt-1 border-dotted flex items-center justify-center cursor-pointer border-dark dark:border-white rounded-2xl dark:bg-dark-light bg-white">
              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <div
                    onClick={() => {
                      if (bannerRef.current) bannerRef.current.click();
                    }}
                    className="h-full w-full flex items-center justify-center bg-dark/10 hover:bg-dark/20 hover:dark:bg-dark/30 z-10"
                  >
                    <ImageIcon
                      className={`text-dark dark:text-white`}
                      size={35}
                    />
                    <FileSelector
                      onSelect={async (ev) => {
                        if (ev.target.files) {
                          const file = ev.target.files[0];
                          onChange(file);
                          const isValid = await trigger('banner');
                          if (isValid) setBannerImage(file);
                        }
                      }}
                      ref={bannerRef}
                      accept="image/png, image/jpeg, image/gif, image/jpg"
                    />
                  </div>
                )}
                name="banner"
              />
              {bannerImage && (
                <div className="absolute h-full w-full rounded-full z-0">
                  <MediaPreview file={bannerImage} isRounded={false} />
                </div>
              )}
            </div>
            {errors.banner && <ShowError error={errors.banner.message} />}
          </div>
          <div className="mt-7 max-w-3xl">
            <Label
              className="font-bold text-dark dark:text-white text-base mb-1"
              isRequired={true}
            >
              Entry Mode
            </Label>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="flex items-center gap-x-2">
                  <Switch
                    type="checkbox"
                    checked={isPaid}
                    onChange={() => {
                      setIsPaid(!isPaid);
                      onChange(!isPaid);
                    }}
                    className="cursor-pointer"
                  />
                  <Label tooltip="" className="dark:text-white/60">
                    {isPaid
                      ? 'This is a paid community'
                      : 'Community is not paid'}
                  </Label>
                </div>
              )}
              name={'is_paid'}
              defaultValue={isPaid}
            />
          </div>
          {isPaid && (
            <div className="mt-7 max-w-3xl">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label
                    className="font-bold text-dark dark:text-white text-base"
                    isRequired={true}
                  >
                    Entry Fee
                  </Label>
                  <Label
                    className="mb-2 dark:text-white/60"
                    tooltip="How much will users pay to join this community"
                  >
                    Community&apos;s entry fee
                  </Label>
                  <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <div className="flex items-center overflow-hidden gap-1 border border-input w-32 rounded-md">
                        <div className="h-12 bg-secondary dark:bg-dark-light px-3 flex items-center justify-center">
                          <p className="font-semibold font-dark/70 dark:text-white/60">
                            APT
                          </p>
                        </div>
                        <Input
                          onChange={onChange}
                          value={value}
                          type="text"
                          className="dark:text-white h-12 text-dark border-none"
                        />
                      </div>
                    )}
                    name="entry_fee"
                  />
                  {errors.entry_fee && (
                    <ShowError error={errors.entry_fee.message} />
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="mt-7 max-w-3xl">
            <Label
              className="font-bold text-dark dark:text-white text-base mb-1"
              isRequired={true}
            >
              Name
            </Label>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <Input
                  onChange={onChange}
                  value={value}
                  type="text"
                  className="dark:text-white h-12 text-dark"
                />
              )}
              name="name"
            />
            {errors.name && <ShowError error={errors.name.message} />}
          </div>
          <div className="mt-7 max-w-3xl">
            <Label
              className="font-bold text-dark dark:text-white text-base"
              isRequired={true}
            >
              Description
            </Label>
            <p className="text-gray-800 dark:text-white/60 text-sm">
              A short description of this collection
            </p>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextArea
                  rows={5}
                  onChange={onChange}
                  placeholder="Collection's description"
                  className="border border-input outline-none mt-1 dark:bg-dark dark:text-white"
                ></TextArea>
              )}
              name="description"
            />
            {errors.description && (
              <ShowError error={errors.description.message} />
            )}
          </div>
          <div className="mt-7 max-w-3xl">
            <Button
              disabled={isSubmitting || isLoading || !isDirty}
              onClick={handleSubmit(onSubmit)}
              type="submit"
            >
              Add Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
