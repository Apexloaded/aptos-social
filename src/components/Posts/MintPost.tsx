'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '../ui/button';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import DexaEditor, { DexaEditorHandle } from '../Editor/DexaEditor';
import CreatorPFP from '../Creator/CreatorPFP';
import PostCounter from './PostCounter';
import {
  ImageIcon,
  SmilePlusIcon,
  ShieldQuestionIcon,
  CalendarPlusIcon,
  XIcon,
} from 'lucide-react';
import GifIcon from '@heroicons/react/24/outline/GifIcon';
import useToast from '@/hooks/toast.hook';
import FileSelector from '../ui/fileselector';
import MediaPreview from './MediaPreview';
import ShowError from '../ui/inputerror';
import { postResolver } from '@/schemas/post.schema';
import { aptosClient } from '@/utils/aptosClient';
import { routes } from '@/routes';
import { useRouter } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { mintPost } from '@/aptos/entry/feeds.entry';
import useCollections from '@/hooks/collections.hook';
import { useAccount } from '@/context/account.context';
import { IUploadFilesResponse } from '@/interfaces/response.interface';
import { IPFS_URL } from '@/config/constants';
import { useOpenAI } from '@/hooks/openai.hook';
import { generateText } from '@/actions/openai.action';
import { readStreamableValue } from 'ai/rsc';

export function MintPost() {
  const router = useRouter();
  const editorRef = useRef<DexaEditorHandle>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const aptosWallet = useWallet();
  const { signAndSubmitTransaction } = useAccount();
  const { collections } = useCollections();
  const [maxWord] = useState(70);
  const [isOpen, setIsOpen] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [exceededCount, setExceededCount] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const { error, loading, updateLoading, success } = useToast();
  const { sendPrompt } = useOpenAI();
  const [generation, setGeneration] = useState<string>('');
  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm({
    ...postResolver,
    reValidateMode: 'onChange',
    mode: 'onChange',
  });
  const content = watch('content', '');
  const isEmptyContent = content === '<p></p>';

  const onWordCount = (count: number) => {
    const percentage = (count / maxWord) * 100;
    setPercentage(percentage);
    if (count > maxWord) {
      const excess = count - maxWord;
      setExceededCount(excess);
    }
  };

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  const toggleMedia = () => {
    if (mediaRef.current) mediaRef.current.click();
  };

  const removeMedia = () => {
    reset({ images: undefined });
    setMediaFile(null);
    if (mediaRef.current) mediaRef.current.value = '';
  };

  const onAiInit = async () => {
    if (!mediaFile) return;
    const formdata = new FormData();
    formdata.append('image', mediaFile);
    const { output } = await generateText(
      'Generate a very short captivating story behind this NFT image',
      formdata
    );

    for await (const delta of readStreamableValue(output)) {
      setValue('content', `${delta}`);
      setGeneration((currentGeneration) => `${currentGeneration}${delta}`);
    }
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      if (!mediaFile) return;
      loading({ msg: 'Processing...' });

      const nftMetadata = {
        description: 'Bear 1 in collection',
        image: 'to_fill_after_upload',
        name: 'bear 1',
        external_url: 'https://your_project_url.io/1',
        attributes: [
          {
            trait_type: 'bear_level',
            value: '1',
          },
        ],
      };

      const formData = new FormData();
      formData.append('files', mediaFile);
      const fileUpload = await fetch('/api/upload/files', {
        method: 'POST',
        body: formData,
      });
      const uploadRes = await fileUpload.json();
      const { pinned, metadata } = uploadRes.data as IUploadFilesResponse;
      const pfpUrl = `https://${pinned.IpfsHash}.${IPFS_URL}`;

      const media_urls = [''];
      const media_mimetypes = [''];

      metadata.map((m) => {
        if (m.id == mediaFile.name) {
          media_urls.push(`${pfpUrl}/${m.fileName}`);
          media_mimetypes.push(m.contentType);
        }
      });
      const metadata_uri = '';
      const collection_obj = '';

      updateLoading({ msg: 'Creating profile...' });
      const response = await signAndSubmitTransaction(
        mintPost({
          content,
          price: 1,
          media_urls,
          media_mimetypes,
          metadata_uri,
          collection_obj,
        })
      );

      if (response) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        if (committedTransactionResponse.success) {
          success({ msg: 'Post minted successfully' });
          close();
          router.push(routes.app.home);
        }
      }
    } catch (err: any) {
      // const msg = getError(err);
      error({ msg: `Error creating profile` });
    }
  };

  return (
    <>
      <Button onClick={open} size="lg" className="w-full font-bold">
        Mint a Post
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
                <CreatorPFP username={'elonmusk'} name={'Elon Musk'} />
                <div className="flex-1 flex flex-col relative">
                  <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <DexaEditor
                          onWordCount={onWordCount}
                          onUpdate={onChange}
                          defaultValue={value}
                          ref={editorRef}
                        />
                        <MediaPreview file={mediaFile} onClear={removeMedia} />
                        {errors.images && (
                          <ShowError error={errors.images.message} />
                        )}
                      </>
                    )}
                    name={'content'}
                  />
                </div>
                {generation}
              </div>
              <div className="flex items-center justify-between border-t border-light pt-[0.8rem]">
                <div className="flex items-center">
                  <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <FileSelector
                          onSelect={(ev) => {
                            if (ev.target.files) {
                              const file = ev.target.files[0];
                              setMediaFile(file);
                              setValue('images', file);
                              onChange(file);
                            }
                          }}
                          ref={mediaRef}
                          accept="image/png, image/jpeg"
                        />
                        <Button
                          size="icon"
                          variant={'ghost'}
                          onClick={toggleMedia}
                          title="Image"
                        >
                          <ImageIcon size={18} />
                        </Button>
                      </>
                    )}
                    name={'images'}
                  />

                  <Button size="icon" variant={'ghost'} title="GIF">
                    <GifIcon height={18} />
                  </Button>
                  <Button size="icon" variant={'ghost'} title="Emoji">
                    <SmilePlusIcon size={18} />
                  </Button>
                  <Button size="icon" variant={'ghost'} title="Pool">
                    <ShieldQuestionIcon size={18} />
                  </Button>
                  <Button size="icon" variant={'ghost'} title="Schedule">
                    <CalendarPlusIcon size={18} />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {percentage > 100 && (
                      <p className="text-xs text-danger">-{exceededCount}</p>
                    )}
                    <PostCounter showText={false} progress={percentage} />
                  </div>

                  <Button
                    onClick={handleSubmit(onSubmit)}
                    type={'submit'}
                    disabled={!isValid || isEmptyContent || isSubmitting}
                    size={'default'}
                    className="rounded-full"
                  >
                    <p className="text-sm font-semibold">{'Mint'}</p>
                  </Button>
                  <Button
                    onClick={onAiInit}
                    type={'button'}
                    size={'default'}
                    className="rounded-full"
                  >
                    <p className="text-sm font-semibold">{'AI'}</p>
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
