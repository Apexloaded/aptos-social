'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import {
  CameraIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  ImageIcon,
} from 'lucide-react';
import FileSelector from '../ui/fileselector';
import ShowError from '../ui/inputerror';
import MediaPreview from '../Posts/MediaPreview';
import { Input } from '../ui/input';
import { HOSTNAME, IPFS_URL } from '@/config/constants';
import { TextArea } from '../ui/textarea';
import { Label } from '../ui/label';
import { addCollectionResolver } from '@/schemas/collection.schema';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { createCollection } from '@/aptos/entry/feeds.entry';
import { aptosClient } from '@/utils/aptosClient';
import useToast from '@/hooks/toast.hook';
import { routes } from '@/routes';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/context/account.context';
import { IUploadFilesResponse } from '@/interfaces/response.interface';

const links = [
  {
    name: 'website',
    url: 'https://www.',
    icon: '',
    placeholder: 'website.com',
  },
  {
    name: 'X',
    url: 'https://x.com/',
    icon: '',
    placeholder: 'your-x-handle',
  },
  {
    name: 'instagram',
    url: 'https://instagram.com/@',
    icon: '',
    placeholder: 'your-ig-handle',
  },
  {
    name: 'discord',
    url: 'https://discord.gg/',
    icon: '',
    placeholder: 'aptos-social',
  },
  {
    name: 'telegram',
    url: 'https://t.me/',
    icon: '',
    placeholder: 'aptos-social',
  },
];

export default function CreateCollection() {
  const router = useRouter();

  const logoRef = useRef<HTMLInputElement>(null);
  const featuredRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const { signAndSubmitTransaction } = useAccount();
  const { error, success, loading, updateLoading } = useToast();

  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const {
    watch,
    control,
    trigger,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading, isDirty },
  } = useForm({ ...addCollectionResolver });
  const custom_id = watch('custom_id');

  const onSubmit = async (data: FieldValues) => {
    loading({ msg: 'Processing...' });
    const formData = new FormData();
    const originalFiles: File[] = [data.logo, data.featured, data.banner];
    const files = renameFiles(originalFiles);
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    updateLoading({ msg: 'Uploading profile images...' });
    try {
      const fileUpload = await fetch('/api/upload/files', {
        method: 'POST',
        body: formData,
      });
      const uploadRes = await fileUpload.json();
      const { pinned, metadata } = uploadRes.data as IUploadFilesResponse;
      const pfpUrl = `https://${pinned.IpfsHash}.${IPFS_URL}`;

      updateLoading({ msg: 'Creating collection...' });
      const logo_img = `${pfpUrl}/${
        metadata.find((m) => m.id == files[0].name)?.fileName
      }`;
      const featured_img = `${pfpUrl}/${
        metadata.find((m) => m.id == files[1].name)?.fileName
      }`;
      const banner_img = `${pfpUrl}/${
        metadata.find((m) => m.id == files[2].name)?.fileName
      }`;
      const { name, max_supply, custom_id, description, royalty } = data;
      const response = await signAndSubmitTransaction(
        createCollection({
          name,
          description,
          max_supply,
          custom_id,
          royalty_percentage: royalty,
          logo_img,
          banner_img,
          featured_img,
        })
      );

      console.log(response);

      if (response) {
        // Wait for the transaction to be commited to chain
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        // Once the transaction has been successfully commited to chain, navigate to the `my-assets` page
        if (committedTransactionResponse.success) {
          success({ msg: 'Profile was successfully created' });
          router.push(routes.app.collections.index);
        }
      }
    } catch (err: any) {
      console.log(err);
      error({ msg: 'Error uploading profile images' });
      throw new Error(`Error uploading collection image and NFT images ${err}`);
    }
  };

  const renameFiles = (files: File[]): File[] => {
    const newNames = ['logo', 'featured', 'banner'];
    return files.map((file, index) => {
      if (index < newNames.length) {
        const fileExtension = file.name.split('.').pop();
        return new File([file], `${newNames[index]}.${fileExtension}`, {
          type: file.type,
        });
      }
      return file;
    });
  };

  return (
    <div className="bg-white dark:bg-dark">
      <div className="px-5 pb-5">
        <h1 className="font-bold text-4xl pt-6 text-gray-800 dark:text-gray-100">
          Create Collection
        </h1>
        <p className="mt-1 text-gray-800 dark:text-gray-400 text-md">
          Create and manage your unique NFTly collections here to share
        </p>
        <div className="mt-5">
          <div className="dark:text-gray-100 text-gray-800 text-sm">
            Fields are marked <span className="text-red-500">*</span> are
            required
          </div>
          <div className="mt-2">
            <p className="font-bold dark:text-gray-100 text-gray-800">
              Collection logo<span className="text-red-500">*</span>
            </p>
            <p className="text-gray-800 dark:text-gray-400 text-sm">
              This logo will appear on your collection
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
              Featured Image
            </p>
            <p className="text-gray-800 dark:text-gray-400 text-sm">
              This logo will appear on your collection
            </p>
            <div className="h-52 relative overflow-hidden max-w-sm border-4 mt-1 border-dotted flex items-center justify-center cursor-pointer border-dark dark:border-white rounded-2xl dark:bg-dark-light bg-white">
              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <div
                    onClick={() => {
                      if (featuredRef.current) featuredRef.current.click();
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
                          const isValid = await trigger('featured');
                          if (isValid) setFeaturedImage(file);
                        }
                      }}
                      ref={featuredRef}
                      accept="image/png, image/jpeg, image/gif, image/jpg"
                    />
                  </div>
                )}
                name="featured"
              />
              {featuredImage && (
                <div className="absolute h-full w-full rounded-full z-0">
                  <MediaPreview file={featuredImage} isRounded={false} />
                </div>
              )}
            </div>
            {errors.featured && <ShowError error={errors.featured.message} />}
          </div>
          <div className="mt-7">
            <p className="font-bold dark:text-gray-100 text-gray-800">
              Banner Image
            </p>
            <p className="text-gray-800 dark:text-gray-400 text-sm">
              This logo will appear on your collection
            </p>
            <div className="h-52 relative overflow-hidden max-w-2xl border-4 mt-1 border-dotted flex items-center justify-center cursor-pointer border-dark dark:border-white rounded-2xl dark:bg-dark-light bg-white">
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
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label
                  className="font-bold text-dark dark:text-white text-base"
                  isRequired={true}
                >
                  Max Supply
                </Label>
                <p className="text-gray-800 dark:text-gray-400 text-sm mb-1">
                  Collection&apos;s maximum supply
                </p>
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
                  name="max_supply"
                />
                {errors.max_supply && (
                  <ShowError error={errors.max_supply.message} />
                )}
              </div>
              <div>
                <Label className="font-bold text-dark dark:text-white text-base">
                  Creator Royalty
                </Label>
                <p className="text-gray-800 dark:text-gray-400 text-sm mb-1">
                  Percentage for this collection (%)
                </p>
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
                  name="royalty"
                />
                {errors.royalty && <ShowError error={errors.royalty.message} />}
              </div>
            </div>
          </div>
          <div className="mt-7 max-w-3xl" ref={urlRef}>
            <Label
              className="font-bold text-dark dark:text-white text-base"
              isRequired={true}
            >
              URL
            </Label>
            <p className="text-gray-800 dark:text-gray-400 text-sm">
              Customize collection&apos;s url below
            </p>
            <div className="w-full mt-1 rounded-lg border border-input flex justify-between items-center px-3 text-dark dark:text-white">
              <div className="flex overflow-scroll w-full justify-start items-center">
                <p>{`${HOSTNAME}`}</p>
                <p>/collections/</p>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      onChange={onChange}
                      type="text"
                      placeholder="custom url"
                      className="dark:text-white h-12 pl-0 text-dark border-none"
                    />
                  )}
                  name="custom_id"
                />
              </div>
            </div>
            {isAvailable == null && custom_id?.length > 0 && (
              <p className="text-dark/60 dark:text-white font text-sm">
                Checking...
              </p>
            )}
            {isAvailable == false && custom_id?.length > 0 && (
              <div className="flex items-center gap-1">
                <p className="text-danger font text-sm">Custom Url Taken</p>
                <CircleAlertIcon size={18} className="text-danger" />
              </div>
            )}
            {isAvailable == true && custom_id?.length > 0 && (
              <div className="flex items-center gap-1">
                <p className="text-primary font text-sm">Available</p>
                <CheckCheckIcon size={18} className="text-primary" />
              </div>
            )}
            {errors.custom_id && <ShowError error={errors.custom_id.message} />}
          </div>
          <div className="mt-7 max-w-3xl">
            <Label
              className="font-bold text-dark dark:text-white text-base"
              isRequired={true}
            >
              Description
            </Label>
            <p className="text-gray-800 dark:text-gray-400 text-sm">
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
          {/* <div className="mt-7 max-w-3xl">
              <p className="font-bold dark:text-gray-100 text-gray-800">
                Category
              </p>
              <p className="text-gray-800 dark:text-gray-400 text-sm">
                Select Collection&apos;s category
              </p>
              <div className="w-72">
                <Listbox value={selected} onChange={setSelected}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full border dark:border-gray-600 border-gray-300 py-2 pl-3 pr-10 text-left bg-gray-50 dark:bg-gray-800 rounded-lg outline-none text-gray-800 dark:text-gray-200">
                      <span className="block truncate">{selected.name}</span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <SelectorIcon
                          className="w-5 h-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute border dark:border-gray-600 border-gray-300 w-full py-1 mt-1 overflow-auto text-base bg-gray-50 dark:bg-gray-800 rounded-md shadow-lg max-h-60">
                        {people.map((categories, i) => (
                          <Listbox.Option
                            key={i}
                            className={({ active }) =>
                              `${
                                active
                                  ? 'text-indigo-600 bg-gray-200 dark:text-gray-200 dark:bg-gray-700'
                                  : 'text-gray-900 dark:text-gray-200'
                              }
                                                                    cursor-default select-none relative py-2 pl-10 pr-4 last:border-none border-b dark:border-gray-600 border-gray-300`
                            }
                            value={categories}
                          >
                            {({ selected, active }) => (
                              <div className="flex">
                                <span
                                  className={`${
                                    selected ? 'font-medium' : 'font-normal'
                                  } block truncate`}
                                >
                                  {categories.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`${
                                      active
                                        ? 'text-indigo-600 dark:text-gray-200'
                                        : 'text-indigo-600'
                                    } absolute left-0 inset-y-0 flex items-center pl-3`}
                                  >
                                    <CheckIcon
                                      className="w-5 h-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
              {errors.image && (
                <span className="text-red-500 text-sm">
                  {errors.image?.message}
                </span>
              )}
            </div> */}
          {/* <div className="mt-7 max-w-3xl">
            <p className="font-bold dark:text-gray-100 text-gray-800">Links</p>
            <div className="rounded-xl mt-1 overflow-hidden bg-white dark:bg-dark border border-input">
              {links.map((link, i) => (
                <div
                  key={i}
                  className="w-full px-3 last:border-none border-b border-input flex justify-start items-center text-gray-800 dark:text-gray-200"
                >
                  <p>{link.url}</p>
                  <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChange={onChange}
                        value={value}
                        type="text"
                        placeholder={link.placeholder}
                        className="dark:text-white h-12 pl-0 text-dark border-none"
                      />
                    )}
                    name={link.name}
                  />
                </div>
              ))}
            </div>
          </div> */}
          <div className="mt-7 max-w-3xl">
            <Button
              disabled={isSubmitting || isLoading || !isDirty}
              onClick={handleSubmit(onSubmit)}
              type="submit"
            >
              Add Collection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
