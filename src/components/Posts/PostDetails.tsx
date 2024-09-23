'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BadgeCheck,
  Diamond,
  EllipsisIcon,
  HandCoinsIcon,
} from 'lucide-react';
import CreatorPFP from '../Creator/CreatorPFP';
import { routes } from '@/routes';
import ShowMore from './ShowMore';
import { IPost, IPostItem } from '@/interfaces/feed.interface';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectedPost } from '@/slices/posts/post-selected.slice';
import { Button } from '../ui/button';
import Moment from 'react-moment';
import { formatWalletAddress, walletToLowercase } from '@/utils/helpers';
import { CommentButton } from './Buttons/CommentButton';
import { LikeButton } from './Buttons/LikeButton';
import { ShareButton } from './Buttons/ShareButton';
import { BookmarkButton } from './Buttons/BookmarkButton';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export function PostDetails() {
  const { account, wallet } = useWallet();
  const _post = useAppSelector(selectedPost);
  const [post, setPost] = useState<IPostItem | undefined>(_post);

  console.log(post);

  return (
    <div className="pb-40 lg:pb-10">
      <div className="flex items-center justify-between px-5">
        <div className="flex items-center space-x-2">
          <CreatorPFP
            pfp={post?.creator.pfp}
            name={post?.creator.name}
            username={post?.creator.username}
          />
          <div className="flex flex-col">
            <Link
              href={routes.app.profile(`${post?.creator.username}`)}
              className="flex items-center space-x-1"
            >
              <p className="font-semibold text-sm capitalize text-dark">
                {post?.creator.name}
              </p>
              <BadgeCheck size={18} className="fill-primary stroke-white" />
            </Link>
            <Link
              href={routes.app.profile(`${post?.creator.username}`)}
              className="text-xs text-medium"
            >
              @{post?.creator.username}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <Button variant={'ghost'} size={'icon'} title="Media">
            <EllipsisIcon size={18} />
          </Button>
        </div>
      </div>
      {post && (
        <div className="mt-2 px-5">
          <ShowMore data={post.post.content} />
          <div className="rounded-xl mt-2 border border-light overflow-auto">
            {post?.post.media.map((media, index) => (
              <Image
                key={index}
                src={media.url}
                height={500}
                width={1000}
                alt={post.post.id}
              />
            ))}
          </div>
        </div>
      )}

      {post &&
        walletToLowercase(`${post.creator.id}`) !=
          walletToLowercase(`${account?.address}`) && (
          <div className="px-5 text-center pt-5">
            <div className="flex items-center justify-center space-x-1 group">
              <Button variant={'default'} title="Tip">
                <div className="flex items-center space-x-1">
                  <HandCoinsIcon height={18} />
                  <p className="text-xs">Give a Tip</p>
                </div>
              </Button>
            </div>
            {Number(post.post.tip_count) > 0 && (
              <p className="text-xs text-medium mt-2">
                {post.post.tip_count}{' '}
                {Number(post.post.tip_count) > 1 ? `people` : `person`} tippped
                the creator.
              </p>
            )}
          </div>
        )}

      <div className="mb-3 pt-5 px-5">
        <div className="flex items-center justify-between space-x-1">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
            <p className="text-sm text-medium">
              <Moment format="hh:mm A · MMM D, YYYY">
                {post?.post.created_at}
              </Moment>
            </p>
            <p className="text-sm text-medium">
              <span className="font-semibold">1,191</span> Views
            </p>
          </div>
          {Number(post?.post.price) > 0 && post?.post.is_collectible && (
            <div className="flex items-center gap-x-2">
              {post?.post.collector !== '0x0' ? (
                <p className="text-primary text-sm">
                  Collected By{' '}
                  <Link href="" className="text-primary">
                    {formatWalletAddress(post.post.collector)}
                  </Link>
                </p>
              ) : (
                <p>Collect Now</p>
              )}

              <Button size="icon">
                <Diamond />
              </Button>
            </div>
          )}
        </div>
      </div>

      {post && (
        <div className="py-2 flex px-5 items-center justify-between border-y border-light">
          <div className="flex items-center space-x-1 group">
            <CommentButton post={post.post} />
          </div>
          <div className="flex items-center space-x-1 group">
            <LikeButton post={post.post} />
          </div>
          <div className="flex items-center space-x-1 group">
            <ShareButton post={post.post} />
          </div>
          <div className="flex items-center space-x-1 group">
            <BookmarkButton post={post.post} />
          </div>
        </div>
      )}
    </div>
  );
}
