'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth.context';
import useToast from '@/hooks/toast.hook';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { IPostItem } from '@/interfaces/feed.interface';
import { ImageIcon, SmilePlusIcon } from 'lucide-react';
import { GifIcon } from '@heroicons/react/24/outline';
import PostCounter from './PostCounter';
import DexaEditor, { DexaEditorHandle } from '../Editor/DexaEditor';
import { useAccount } from '@/context/account.context';
import { Button } from '../ui/button';
import FileSelector from '../ui/fileselector';
import CreatorPFP from '../Creator/CreatorPFP';
import { addComment } from '@/aptos/entry/feeds.entry';
import { aptosClient } from '@/utils/aptosClient';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';

type Props = {
  post: IPostItem;
};

function NewComment({ post }: Props) {
  const editorRef = useRef<DexaEditorHandle>(null);
  const { user } = useAuth();
  const [maxWord] = useState(70);
  const { address, signAndSubmitTransaction } = useAccount();
  const [percentage, setPercentage] = useState(0);
  const [exceededCount, setExceededCount] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const { loading, success, error } = useToast();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
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

  const toggleMedia = () => {
    if (mediaRef.current) mediaRef.current.click();
  };

  const removeMedia = () => {
    reset({ images: undefined });
    setMediaFile(null);
    if (mediaRef.current) mediaRef.current.value = '';
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      if (!post) return;
      loading({
        msg: 'Replying',
      });
      const response = await signAndSubmitTransaction(
        addComment({
          comment: content,
          post_id: post.post.id,
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
            queryKey: [QueryKeys.PostDetails, post.post.id],
          });
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.Comments, post.post.id],
          });
          success({ msg: 'Reply sent' });
          removeMedia();
          editorRef.current?.clearEditor();
          close();
        }
      }
    } catch (err) {
      error({ msg: `Error sending reply` });
    }
  };

  const resetForm = () => {
    editorRef.current?.clearEditor();
  };

  return (
    <div>
      <div className="pt-4 flex items-start space-x-3 px-5">
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
              </>
            )}
            name={'content'}
            rules={{
              required: 'Content is required',
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-5 border-t border-light py-2">
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
                  type={'button'}
                  onClick={toggleMedia}
                  variant={'ghost'}
                  size={'icon'}
                  title="Media"
                >
                  <ImageIcon size={18} />
                </Button>
              </>
            )}
            name={'images'}
          />

          <Button variant={'ghost'} size={'icon'} title="GIF">
            <GifIcon height={23} />
          </Button>
          <Button variant={'ghost'} size={'icon'} title="Emoji">
            <SmilePlusIcon size={18} />
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
            size={'sm'}
            className="rounded-full"
            disabled={!isValid || isEmptyContent || isSubmitting}
          >
            <p className="text-sm font-semibold">Reply</p>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NewComment;
