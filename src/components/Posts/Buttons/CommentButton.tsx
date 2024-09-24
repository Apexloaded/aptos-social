'use client';

import { useState, useRef, BaseSyntheticEvent } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import DexaEditor, { DexaEditorHandle } from '@/components/Editor/DexaEditor';
import CreatorPFP from '@/components/Creator/CreatorPFP';
import PostCounter from '@/components/Posts/PostCounter';
import {
  ImageIcon,
  SmilePlusIcon,
  ShieldQuestionIcon,
  CalendarPlusIcon,
  XIcon,
  MessageSquareTextIcon,
} from 'lucide-react';
import GifIcon from '@heroicons/react/24/outline/GifIcon';
import useToast from '@/hooks/toast.hook';
import FileSelector from '@/components/ui/fileselector';
import MediaPreview from '@/components/Posts/MediaPreview';
import ShowError from '@/components/ui/inputerror';
import { aptosClient } from '@/utils/aptosClient';
import { routes } from '@/routes';
import { useRouter } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { addComment } from '@/aptos/entry/feeds.entry';
import useCollections from '@/hooks/collections.hook';
import { useAccount } from '@/context/account.context';
import { QueryKeys } from '@/config/query-keys';
import { queryClient } from '@/providers/ReactQueryProvider';
import { ButtonProps } from '../PostButtons';
import { useAuth } from '@/context/auth.context';
import ShowMore from '../ShowMore';
import CreatorName from '@/components/Creator/CreatorName';

export function CommentButton({ post, creator }: ButtonProps) {
  const router = useRouter();
  const editorRef = useRef<DexaEditorHandle>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const aptosWallet = useWallet();
  const { user } = useAuth();
  const { signAndSubmitTransaction } = useAccount();
  const { collections } = useCollections();
  const [maxWord] = useState(70);
  const [isOpen, setIsOpen] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [exceededCount, setExceededCount] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const { error, loading, updateLoading, success } = useToast();
  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm({
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

  const onSubmit = async (data: FieldValues, event?: BaseSyntheticEvent) => {
    try {
      event?.preventDefault();
      event?.stopPropagation();
      // if (!mediaFile) return;
      loading({ msg: 'Processing...' });

      // const formData = new FormData();
      // updateLoading({ msg: 'Uploading NFT image...' });
      // formData.append('files', mediaFile);
      // const filesRes = await uploadFiles(formData);
      // if (!filesRes.status) {
      //   return error({ msg: filesRes.message || 'Error uploading files' });
      // }

      // const { pinned, metadata } = filesRes.data as IUploadFilesResponse;
      // const pfpUrl = `https://${pinned.IpfsHash}.${IPFS_URL}`;

      // const media_urls: string[] = [];
      // const media_mimetypes: string[] = [];

      // metadata.map((m) => {
      //   if (m.id == mediaFile.name) {
      //     media_urls.push(`${pfpUrl}/${m.fileName}`);
      //     media_mimetypes.push(m.contentType);
      //   }
      // });

      // updateLoading({ msg: 'Generating NFT metadata...' });
      // const nftMetadata = {
      //   name: 'Aptos Social Feeds',
      //   description: 'Bear 1 in collection',
      //   image: media_urls[0],
      //   external_url: 'https://your_project_url.io/1',
      //   attributes: [
      //     {
      //       trait_type: 'bear_level',
      //       value: '1',
      //     },
      //   ],
      // };
      // const jsonString = JSON.stringify(nftMetadata, null, 2);
      // const file = new File([jsonString], 'metadata.json', {
      //   type: 'application/json',
      // });
      // formData.append('file', file);
      // const fileRes = await uploadFile(formData);
      // if (!fileRes.status) {
      //   return error({ msg: fileRes.message || 'Error uploading file' });
      // }

      // const { IpfsHash } = fileRes.data as PinResponse;
      // const metadata_uri = `https://${IpfsHash}.${IPFS_URL}`;
      // const collection_obj = collections[0].collection_id;

      updateLoading({ msg: 'Replying...' });
      const response = await signAndSubmitTransaction(
        addComment({
          comment: content,
          post_id: post.id,
        })
      );

      if (response) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        if (committedTransactionResponse.success) {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Posts] });
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.PostDetails, post.id],
          });
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.Comments, post.id],
          });
          success({ msg: 'Reply sent' });
          removeMedia();
          editorRef.current?.clearEditor();
          close();
        }
      }
    } catch (err: any) {
      // const msg = getError(err);
      error({ msg: `Error sending reply` });
    }
  };

  return (
    <>
      <div
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        className="flex items-center gap-x-1 group"
      >
        <MessageSquareTextIcon
          size={20}
          className="text-dark dark:text-white group-hover:text-primary"
        />
        <p className="text-xs group-hover:text-primary text-dark dark:text-white">
          {post.comment_count > 0 ? post.comment_count : ''}
        </p>
      </div>

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
              <div className="bg-white dark:bg-dark pb-5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <CreatorPFP
                      username={creator.username}
                      name={creator.name}
                      pfp={creator.pfp}
                    />
                    <CreatorName
                      username={creator.username}
                      name={creator.name}
                      createdAt={post.created_at}
                    />
                  </div>
                </div>
                <div className="mt-2 pl-12">
                  <ShowMore data={post.content} />
                </div>
              </div>
              <div className="mt-2 flex items-start space-x-3">
                <CreatorPFP
                  username={user?.username}
                  name={user?.name}
                  pfp={user?.pfp}
                />
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
                          placeholder="Send a reply to this story"
                        />
                        <MediaPreview file={mediaFile} onClear={removeMedia} />
                        {errors.images && (
                          <ShowError error={errors.images.message} />
                        )}
                      </>
                    )}
                    name={'content'}
                    rules={{
                      required: 'Content is required',
                    }}
                  />
                </div>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmit(onSubmit)(e);
                    }}
                    type={'button'}
                    disabled={!isValid || isEmptyContent || isSubmitting}
                    size={'default'}
                    className="rounded-full"
                  >
                    <p className="text-sm font-semibold">Reply</p>
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
