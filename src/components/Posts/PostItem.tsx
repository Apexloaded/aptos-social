'use client';

import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { BellRingIcon, EllipsisIcon, Grid2x2PlusIcon } from 'lucide-react';
import NFT1 from '@/assets/nft/1.png';
import Image from 'next/image';
import ShowMore from './ShowMore';
import { useRouter } from 'next/navigation';
import { routes } from '@/routes';
import { IPostItem } from '@/interfaces/feed.interface';
import { PostButtons } from './PostButtons';
import { BookmarkButton } from './Buttons/BookmarkButton';
import { useAppDispatch } from '@/hooks/redux.hook';
import CreatorName from '../Creator/CreatorName';
import CreatorPFP from '../Creator/CreatorPFP';
import { selectPost } from '@/slices/posts/post-selected.slice';
import { useAccount } from '@/context/account.context';
import { BLURURL } from '@/config/constants';
import OptimizedImage from './OptimizedImage';
import CollectButton from './Buttons/CollectButton';

export function PostItem({ post, creator }: IPostItem) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const username = creator.username;
  const { address } = useAccount();

  const isOwner = address === post.author;
  const isMediaAvailable = post.media.length > 0;

  useEffect(() => {
    router.prefetch(routes.app.mints(`${username}`, post.id.toString()));
  }, []);

  const postDetails = () => {
    router.push(routes.app.mints(`${username}`, post.id.toString()), {
      scroll: false,
    });
    dispatch(selectPost({ post, creator }));
  };

  return (
    <div
      onClick={postDetails}
      role="button"
      className="bg-white dark:bg-dark p-5 rounded-2xl shadow-sm"
    >
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
        <div className="flex items-center gap-x-2">
          <Button size="icon" className="h-9 w-9">
            <BellRingIcon size={20} />
          </Button>
          <Button size="icon" variant="secondary">
            <EllipsisIcon size={20} />
          </Button>
        </div>
      </div>

      {isMediaAvailable && (
        <div className="mt-4 mb-3 rounded-2xl border border-light dark:border-dark-light max-h-[35rem] overflow-hidden">
          <OptimizedImage
            src={post.media[0].url}
            alt={`Story ${post.id}`}
            height={400}
            width={600}
          />
          {/* <Image
          src={post.media[0].url}
          height={400}
          width={600}
          placeholder="blur"
          alt={`Story ${post.id}`}
          priority={true}
          quality={30}
          blurDataURL={BLURURL}
        /> */}
        </div>
      )}

      <div
        className={`flex ${isMediaAvailable ? 'flex-col' : 'flex-col-reverse'}`}
      >
        <div className="flex items-center py-1 justify-between">
          <PostButtons post={post} creator={creator} />
          <div className="flex items-center">
            {post.collector === '0x0' &&
              post.is_collectible === true &&
              !isOwner && <CollectButton post={post} creator={creator} />}
            <Button
              size={'icon'}
              variant={'ghost'}
              className="dark:hover:bg-dark"
            >
              <BookmarkButton post={post} creator={creator} />
            </Button>
          </div>
        </div>
        <div className={`${isMediaAvailable ? '-mt-3' : ''}`}>
          <ShowMore
            onClick={postDetails}
            data={post.content}
            isShowMore={true}
          />
        </div>
      </div>

      {/* <div>Hash Tags</div> */}
    </div>
  );
}
