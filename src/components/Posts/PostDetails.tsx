'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, EllipsisIcon, HandCoinsIcon } from 'lucide-react';
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
import PostsComment from './PostsComments';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { getPostById } from '@/aptos/view/feeds.view';
import { mapPost } from '@/lib/posts';
import { BLURURL } from '@/config/constants';
import OptimizedImage from './OptimizedImage';
import { useAccount } from '@/context/account.context';
import { Diamond } from '../Icons/Icons';

type Props = {
  id: string;
};
export function PostDetails({ id }: Props) {
  const { address } = useAccount();
  const _post = useAppSelector(selectedPost);
  const [post, setPost] = useState<IPostItem | undefined>(_post);

  const { data } = useQuery({
    queryKey: [QueryKeys.PostDetails, id],
    queryFn: async () => {
      const response = await getPostById(Number(id));
      const mappedPost = mapPost(response.post);
      return { creator: response.creator, post: mappedPost } as IPostItem;
    },
  });

  useEffect(() => {
    if (data) {
      setPost(data);
    }
  }, [data]);

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
              <p className="font-semibold text-sm capitalize text-dark dark:text-white">
                {post?.creator.name}
              </p>
              <BadgeCheck size={18} className="fill-primary stroke-white" />
            </Link>
            <Link
              href={routes.app.profile(`${post?.creator.username}`)}
              className="text-xs text-dark dark:text-white/70"
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
              <OptimizedImage
                key={index}
                src={media.url}
                height={500}
                width={1000}
                alt={`Story ${post.post.id}`}
              />
              // <Image
              //   key={index}
              //   src={media.url}
              //   height={500}
              //   width={1000}
              //   alt={`Story ${post.post.id}`}
              //   priority={true}
              //   placeholder="blur"
              //   blurDataURL={BLURURL}
              // />
            ))}
          </div>
        </div>
      )}

      {post &&
        walletToLowercase(`${post.creator.wallet}`) !=
          walletToLowercase(`${address}`) && (
          <div className="px-5 text-center pt-5">
            <div className="flex items-center justify-center space-x-1 group">
              <Button variant={'default'} size={'sm'} title="Tip">
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
            <p className="text-sm text-dark dark:text-white/70">
              <Moment format="hh:mm A · MMM D, YYYY">
                {post?.post.created_at}
              </Moment>
            </p>
            <p className="text-sm text-dark dark:text-white/70">
              <span className="font-semibold">1,191</span> Views
            </p>
          </div>
          {Number(post?.post.price) > 0 &&
            post?.post.is_collectible &&
            walletToLowercase(`${post.creator.wallet}`) !=
              walletToLowercase(`${address}`) && (
              <div className="flex items-center gap-x-2">
                {post?.post.collector !== '0x0' ? (
                  <p className="text-primary text-sm">
                    Collected By{' '}
                    <Link href="" className="text-primary">
                      {formatWalletAddress(post.post.collector)}
                    </Link>
                  </p>
                ) : (
                  <p className="text-primary">Collect Now</p>
                )}

                <Button size="icon" variant={'ghost'}>
                  <Diamond />
                </Button>
              </div>
            )}
        </div>
      </div>

      {post && (
        <div className="py-2 flex px-5 items-center justify-between border-y border-light">
          <div className="flex items-center space-x-1 group">
            <CommentButton post={post.post} creator={post.creator} />
          </div>
          <div className="flex items-center space-x-1 group">
            <LikeButton post={post.post} creator={post.creator} />
          </div>
          <div className="flex items-center space-x-1 group">
            <ShareButton post={post.post} creator={post.creator} />
          </div>
          <div className="flex items-center space-x-1 group">
            <BookmarkButton post={post.post} creator={post.creator} />
          </div>
        </div>
      )}

      {post && (
        <div>
          <PostsComment post={post} />
        </div>
      )}
    </div>
  );
}
