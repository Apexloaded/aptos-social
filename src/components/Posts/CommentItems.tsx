'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { EllipsisIcon, TrendingDownIcon } from 'lucide-react';
import { IPostItem } from '@/interfaces/feed.interface';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux.hook';
import { selectPost } from '@/slices/posts/post-selected.slice';
import { routes } from '@/routes';
import CreatorPFP from '../Creator/CreatorPFP';
import CreatorName from '../Creator/CreatorName';
import { Button } from '../ui/button';
import ShowMore from './ShowMore';
import { Diamond } from '../Icons/Icons';
import { CommentButton } from './Buttons/CommentButton';
import { LikeButton } from './Buttons/LikeButton';
import { ShareButton } from './Buttons/ShareButton';
import { BookmarkButton } from './Buttons/BookmarkButton';

function CommentItems({ post, creator }: IPostItem) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    router.prefetch(routes.app.mints(`${creator.username}`, `${post.id}`));
  }, []);

  const postDetails = () => {
    router.push(routes.app.mints(`${creator.username}`, `${post.id}`), {
      scroll: false,
    });
    dispatch(selectPost({ post, creator }));
  };

  const prevent = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <>
      <div
        onClick={postDetails}
        className="hover:bg-light cursor-pointer px-5 pb-2 pt-5"
      >
        <div className="flex items-start space-x-3">
          <div className="min-w-[2.5rem] sticky top-0 flex flex-col gap-3 items-center">
            <CreatorPFP
              username={creator.username}
              name={creator.name}
              pfp={creator.pfp}
            />
            {Number(post.price) > 0 && (
              <div className="flex flex-col items-center">
                <Button
                  onClick={(e) => {
                    // setRemintModal(true);
                    prevent(e);
                  }}
                  type={'button'}
                >
                  <Diamond />
                </Button>
                {/* {post.remintedBy && post.remintedBy.length > 0 && (
                  <p className="text-primary text-sm">
                    {post.remintedBy.length}
                  </p>
                )} */}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CreatorName
                name={creator.name}
                username={creator.username}
                createdAt={post.created_at}
              />
              <div>
                <Button size="icon" variant="secondary">
                  <EllipsisIcon size={20} />
                </Button>
              </div>
            </div>

            {post && post.content && (
              <div className="mt-2">
                <ShowMore
                  onClick={postDetails}
                  data={post.content}
                  isShowMore={true}
                />
              </div>
            )}

            {post.media &&
              post.media.map((media, index) => (
                <div
                  key={index}
                  className="my-2 rounded-xl border border-light max-h-[35rem] overflow-hidden"
                >
                  <Image
                    key={index}
                    src={media.url}
                    height={400}
                    width={600}
                    placeholder="blur"
                    alt={`Story ${post.id}`}
                    priority={true}
                    blurDataURL="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
                  />
                </div>
              ))}

            {!post.is_comment && (
              <div>
                <div className="flex items-center justify-between">
                  <div></div>
                  <div className="flex items-center space-x-1">
                    <TrendingDownIcon size={18} className="text-danger" />
                    <p className="text-danger text-sm text-right">Bearish</p>
                  </div>
                </div>
              </div>
            )}

            {post && (
              <div className="pb-2 pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-1 group">
                  <CommentButton post={post} creator={creator} />
                </div>
                <div className="flex items-center space-x-1 group">
                  <LikeButton post={post} creator={creator} />
                </div>
                <div className="flex items-center space-x-1 group">
                  <ShareButton post={post} creator={creator} />
                </div>
                <div className="flex items-center space-x-1 group">
                  <BookmarkButton post={post} creator={creator} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CommentItems;
