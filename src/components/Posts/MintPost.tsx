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
import { generateText } from '@/actions/openai.action';
import { readStreamableValue } from 'ai/rsc';
import { uploadFile, uploadFiles } from '@/actions/pinata.action';
import { PinResponse } from 'pinata-web3';
import { generate_nft_story_prompt } from '@/lib/prompts';
import { QueryKeys } from '@/config/query-keys';
import { queryClient } from '@/providers/ReactQueryProvider';
import { useAuth } from '@/context/auth.context';
import { amountToApt, APT_DECIMALS } from '@/utils/helpers';
import NewPostForm from './NewPostForm';

export function MintPost() {
  const router = useRouter();
  const editorRef = useRef<DexaEditorHandle>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
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
    console.log(text);
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      if (!mediaFile) return;
      loading({ msg: 'Processing...' });

      const formData = new FormData();
      updateLoading({ msg: 'Uploading NFT image...' });
      formData.append('files', mediaFile);
      const filesRes = await uploadFiles(formData);
      if (!filesRes.status) {
        return error({ msg: filesRes.message || 'Error uploading files' });
      }

      const { pinned, metadata } = filesRes.data as IUploadFilesResponse;
      const pfpUrl = `https://${pinned.IpfsHash}.${IPFS_URL}`;

      const media_urls: string[] = [];
      const media_mimetypes: string[] = [];

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
      const metadata_uri = `https://${IpfsHash}.${IPFS_URL}`;
      const collection_obj = collections[0].collection_id;

      updateLoading({ msg: 'Minting post...' });
      const response = await signAndSubmitTransaction(
        mintPost({
          content,
          price: amountToApt(2, APT_DECIMALS),
          media_urls,
          media_mimetypes,
          metadata_uri,
          collection_obj,
          is_nft_post: true,
        })
      );

      if (response) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: response.hash,
          });

        if (committedTransactionResponse.success) {
          queryClient.invalidateQueries({ queryKey: [QueryKeys.Posts] });
          success({ msg: 'Post minted successfully' });
          removeMedia();
          editorRef.current?.clearEditor();
          close();
          router.push(routes.app.home);
        }
      }
    } catch (err: any) {
      error({ msg: `Error minting post` });
    }
  };

  return (
    <>
      <Button onClick={open} size="lg" className="w-full font-bold">
        Tell a Story
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
                <NewPostForm close={close} />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
