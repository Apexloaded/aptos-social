import React from 'react';
import BlueCheckMark from './BlueCheck';
import { routes } from '@/routes';
import Link from 'next/link';
import Moment from 'react-moment';

type Props = {
  username?: string;
  name?: string;
  createdAt?: string;
};

function CreatorName({ username, name, createdAt }: Props) {
  const prevent = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
  };
  return (
    <div className="flex flex-col">
      <Link
        onClick={prevent}
        href={routes.app.profile(`${username}`)}
        className="flex items-center space-x-1"
      >
        <p className="font-semibold text-sm capitalize text-dark dark:text-white/80">
          {name}
        </p>
        <BlueCheckMark />
        <p className="text-xs text-dark/80 dark:text-white/80">@{username}</p>
      </Link>
      <p className="text-xs text-dark/60 dark:text-white/60">
        <Moment fromNow>{createdAt}</Moment>
      </p>
    </div>
  );
}

export default CreatorName;
