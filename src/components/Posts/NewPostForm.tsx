'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CalendarPlusIcon,
  ImageIcon,
  ShieldQuestionIcon,
  SmilePlusIcon,
} from 'lucide-react';
import { GifIcon } from '@heroicons/react/24/outline';
import PostCounter from './PostCounter';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { postResolver } from '@/schemas/post.schema';
import { useAuth } from '@/context/auth.context';
import useToast from '@/hooks/toast.hook';
import { useRouter } from 'next/navigation';
import DexaEditor, { DexaEditorHandle } from '../Editor/DexaEditor';
import { useAppDispatch } from '@/hooks/redux.hook';
import CreatorPFP from '../Creator/CreatorPFP';
import MediaPreview from './MediaPreview';
import ShowError from '../ui/inputerror';
import FileSelector from '../ui/fileselector';
import { Button } from '../ui/button';
import { routes } from '@/routes';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';
import { aptosClient } from '@/utils/aptosClient';
import { mintPost } from '@/aptos/entry/feeds.entry';
import { amountToApt, APT_DECIMALS, validateImage } from '@/utils/helpers';
import { useAccount } from '@/context/account.context';
import { uploadFile, uploadFiles } from '@/actions/pinata.action';
import { PinResponse } from 'pinata-web3';
import useCollections from '@/hooks/collections.hook';
import { IPFS_URL } from '@/config/constants';
import { IUploadFilesResponse } from '@/interfaces/response.interface';
import { AptosIcon } from '../Icons/Icons';
import PostFee from './PostFee';
import { readStreamableValue } from 'ai/rsc';
import { generateText } from '@/actions/openai.action';
import { generate_nft_story_prompt } from '@/lib/prompts';
import Switch from '../ui/switch';
import { Label } from '../ui/label';
import GradientRing from '../ApstoAiIcon';

type Props = {
  close?: () => void;
};
function NewPostForm({ close }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [postPrice, setPostPrice] = useState<string>('0');
  const [isMintable, setIsMintable] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [maxWord] = useState(70);
  const { loading, success, error, updateLoading } = useToast();
  const mediaRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<DexaEditorHandle>(null);
  const { collections } = useCollections();
  const { signAndSubmitTransaction, address } = useAccount();
  const { user } = useAuth();
  const [percentage, setPercentage] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [exceededCount, setExceededCount] = useState(0);
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isValid, errors, isSubmitting },
    watch,
  } = useForm({
    reValidateMode: 'onChange',
    mode: 'onChange',
  });
  const content = watch('content', '');
  const isEmptyContent = content === '<p></p>';

  useEffect(() => {
    router.prefetch(routes.app.live.index);
  }, []);

  useEffect(() => {
    if (!isEmptyContent && mediaFile && !isMintable) {
      setIsMintable(true);
    } else {
      setIsMintable(false);
      setPostPrice('0');
    }
  }, [isEmptyContent, mediaFile]);

  const onAiInit = async () => {
    if (!mediaFile) return;
    setIsThinking(true);
    const formdata = new FormData();
    formdata.append('image', mediaFile);
    const { output } = await generateText(generate_nft_story_prompt, formdata);

    let text = '';
    for await (const delta of readStreamableValue(output)) {
      text += delta;
      editorRef.current?.setValue(text);
      setValue('content', `${text}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    setIsThinking(false);
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      loading({ msg: 'Processing...' });

      const media_urls: string[] = [];
      const media_mimetypes: string[] = [];
      let metadata_uri = '';

      if (mediaFile) {
        updateLoading({ msg: 'Uploading NFT image...' });
        const formData = new FormData();
        formData.append('files', mediaFile);
        const filesRes = await uploadFiles(formData);
        if (!filesRes.status) {
          return error({
            msg: filesRes.message || 'Error uploading files',
          });
        }

        const { pinned, metadata } = filesRes.data as IUploadFilesResponse;
        const pfpUrl = `https://${pinned.IpfsHash}.${IPFS_URL}`;

        metadata.map((m) => {
          if (m.id == mediaFile.name) {
            media_urls.push(`${pfpUrl}/${m.fileName}`);
            media_mimetypes.push(m.contentType);
          }
        });

        updateLoading({ msg: 'Generating NFT metadata...' });
        const nftMetadata = {
          name: 'Aptos Social Feeds',
          description: 'Bear 1 in collection',
          image: media_urls[0],
          external_url: 'https://your_project_url.io/1',
          attributes: [
            {
              trait_type: 'bear_level',
              value: '1',
            },
          ],
        };
        const jsonString = JSON.stringify(nftMetadata, null, 2);
        const file = new File([jsonString], 'metadata.json', {
          type: 'application/json',
        });
        formData.append('file', file);
        const fileRes = await uploadFile(formData);
        if (!fileRes.status) {
          return error({ msg: fileRes.message || 'Error uploading file' });
        }

        const { IpfsHash } = fileRes.data as PinResponse;
        metadata_uri = `https://${IpfsHash}.${IPFS_URL}`;
      }

      const collection_obj = collections[0].collection_id;
      updateLoading({ msg: 'Minting post...' });
      const response = await signAndSubmitTransaction(
        mintPost({
          content,
          price: amountToApt(Number(postPrice), APT_DECIMALS),
          media_urls,
          media_mimetypes,
          metadata_uri,
          collection_obj,
          is_nft_post: isMintable,
        })
      );

      if (response) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        if (committedTransactionResponse.success) {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Posts] });
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Trends] });
          success({ msg: 'Post minted successfully' });
          resetForm();
          if (close) close();
          //router.push(routes.app.home);
        }
      }
    } catch (err: any) {
      console.log(err);
      error({ msg: `Error minting post` });
    }
  };

  const onWordCount = (count: number) => {
    const percentage = (count / maxWord) * 100;
    setPercentage(percentage);
    if (count > maxWord) {
      const excess = count - maxWord;
      setExceededCount(excess);
    }
  };

  const toggleMedia = () => {
    if (mediaRef.current) mediaRef.current.click();
  };

  const removeMedia = () => {
    reset({ images: undefined });
    setMediaFile(null);
    if (mediaRef.current) mediaRef.current.value = '';
  };

  const resetForm = () => {
    reset();
    removeMedia();
    setPostPrice('0');
    editorRef.current?.clearEditor();
    setPercentage(0);
  };

  return (
    <>
      <CreatorPFP username={user?.username} name={user?.name} pfp={user?.pfp} />
      <div className="flex-1 flex flex-col relative">
        {!isEmptyContent && mediaFile && (
          <div className="flex justify-between items-center">
            <PostFee value={postPrice} onInput={setPostPrice} />
            <div className="flex items-center right-0 absolute gap-1">
              <p className="text-sm text-primary font-semibold">{postPrice}</p>
              <p className="text-sm">Aptos</p>
              <AptosIcon />
            </div>
          </div>
        )}

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
              {errors.images && <ShowError error={errors.images.message} />}
            </>
          )}
          name={'content'}
          rules={{ required: 'What is on your mind?' }}
        />
        <div className="flex justify-between items-center py-2">
          {!isEmptyContent && mediaFile && (
            <div className="py-2 flex items-center gap-x-2">
              <Switch
                type="checkbox"
                checked={isMintable}
                onChange={() => setIsMintable(!isMintable)}
                className="cursor-pointer"
              />
              <Label
                tooltip={
                  isMintable
                    ? 'Users can collect your this after you have minted it'
                    : 'This post cannot be collected by other users'
                }
              >
                {isMintable ? 'Post is collectible' : 'Post is not collectible'}
              </Label>
            </div>
          )}
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
              rules={
                isMintable
                  ? {
                      required: 'Please select an image',
                      validate: validateImage,
                    }
                  : {}
              }
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
              disabled={isThinking}
              variant={'ghost'}
              size={'icon'}
              className={`rounded-full ${isThinking ? 'cursor-progress' : ''}`}
            >
              <GradientRing />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewPostForm;
