"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { BellRingIcon, Grid2x2PlusIcon } from "lucide-react";
import NFT1 from "@/assets/nft/1.png";
import Image from "next/image";
import ShowMore from "./ShowMore";
import { useRouter } from "next/navigation";
import { routes } from "@/routes";
import { IPostItem } from "@/interfaces/feed.interface";
import { PostButtons } from "./PostButtons";
import { Bookmark } from "./Buttons/Bookmark";
import { useAppDispatch } from "@/hooks/redux.hook";

export function PostItem({ post }: IPostItem) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    router.prefetch(routes.app.mints(post.id));
  }, []);

  const postDetails = () => {
    router.push(routes.app.mints(post.id), {
      scroll: false,
    });
    // dispatch(selectPost(post));
  };
  return (
    <div className="bg-white dark:bg-dark p-5 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-x-2">
          <Button size="icon" className="h-9 w-9">
            <BellRingIcon size={20} />
          </Button>
          <Button size="sm" variant="secondary" className="rounded-full">
            Following
          </Button>
        </div>
      </div>
      <div className="mt-4 mb-3 rounded-2xl border border-light dark:border-dark-light max-h-[35rem] overflow-hidden">
        <Image
          src={NFT1}
          height={400}
          width={600}
          placeholder="blur"
          alt={""}
          priority={true}
          blurDataURL="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
        />
      </div>
      <div className="flex items-center py-1 justify-between">
        <PostButtons />
        <div className="flex items-center">
          <Button size="sm" variant="default" className="rounded-full">
            <Grid2x2PlusIcon size={16} />
            <p>Collect</p>
          </Button>
          <Button
            size={"icon"}
            variant={"ghost"}
            className="dark:hover:bg-dark"
          >
            <Bookmark />
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <ShowMore onClick={postDetails} data={post.content} isShowMore={true} />
      </div>
      {/* <div>Hash Tags</div> */}
    </div>
  );
}
