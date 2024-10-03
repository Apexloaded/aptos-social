'use client';

import React from 'react';
import { useAuth } from '@/context/auth.context';
import { UserInterface } from '@/interfaces/user.interface';
import CreatorPFP from './CreatorPFP';
import Link from 'next/link';
import { routes } from '@/routes';
import FollowButton from './FollowButton';

type Props = {
  user: UserInterface;
};
export default function ListUsersToFollow({ user }: Props) {
  const { user: authUser } = useAuth();
  const isFollowing =
    authUser && user ? user.followers.includes(`${authUser?.wallet}`) : false;

  return (
    <div className="flex px-4 items-center justify-between py-4 hover:bg-secondary cursor-pointer">
      <div className="flex items-center gap-x-2">
        <CreatorPFP
          username={user?.username}
          name={user?.name}
          pfp={user?.pfp}
        />
        <div className="text-sm">
          <div className="gap-x-2 flex items-center">
            <Link
              href={routes.app.profile(`${user.username}`)}
              className="font-semibold"
            >
              {user?.name}
            </Link>
          </div>
          <span className="text-dark/70">@{user?.username}</span>
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        <FollowButton
          className="h-8"
          to={`${user?.wallet}`}
          isFollowing={isFollowing}
        />
      </div>
    </div>
  );
}
