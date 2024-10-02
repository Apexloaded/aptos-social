'use client';

import {
  AtomIcon,
  BanknoteIcon,
  BellDotIcon,
  BookmarkIcon,
  BoxIcon,
  CandlestickChart,
  ChevronDownIcon,
  DatabaseIcon,
  DotIcon,
  EllipsisIcon,
  HomeIcon,
  LogOutIcon,
  MailIcon,
  PodcastIcon,
  Rows3Icon,
  SettingsIcon,
  Users2Icon,
  UsersIcon,
  Wallet2Icon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '../Icons/Icons';
import { routes } from '@/routes';
import clsx from 'clsx';
import { useMediaQuery } from '@/hooks/media-query.hook';
import { MintPost } from '../Posts/MintPost';
import { useAuth } from '@/context/auth.context';
import { ISectionedMenu } from '@/interfaces/menu.interface';
import { MenuItems } from './MenuItems';
import QuickProfile from './QuickProfile';

export default function Sidebar() {
  const isLg = useMediaQuery('(max-width: 1024px)');
  const path = usePathname();
  const { user, logout } = useAuth();

  const sectionedNavigation: ISectionedMenu[] = [
    {
      title: 'Home',
      menu: [
        { name: 'Feeds', href: routes.app.home, icon: AtomIcon },
        {
          name: 'Explore',
          href: routes.app.explore,
          icon: BoxIcon,
        },
        {
          name: 'Collections',
          href: routes.app.collections.index,
          icon: DatabaseIcon,
        },
      ],
    },
    {
      title: 'Chats',
      menu: [
        {
          name: 'Notifications',
          href: routes.app.notifications,
          icon: BellDotIcon,
        },
        {
          name: 'Messages',
          href: routes.app.messages.index,
          icon: MailIcon,
        },
      ],
    },
    {
      title: 'Chats',
      menu: [
        {
          name: 'Wallet',
          href: routes.app.wallet.index,
          icon: Wallet2Icon,
        },
        {
          name: 'Settings',
          href: routes.app.settings,
          icon: SettingsIcon,
        },
        {
          name: 'Community',
          href: routes.app.community,
          icon: UsersIcon,
        },
      ],
    },
  ];

  const navigation = [
    { name: 'Feeds', href: routes.home, icon: AtomIcon },
    {
      name: 'Explore',
      href: routes.app.explore,
      icon: BoxIcon,
    },
    {
      name: 'Messages',
      href: routes.app.messages.index,
      icon: MailIcon,
    },
    // {
    //   name: "Notifications",
    //   href: "/notifications",
    //   icon: BellDotIcon,
    // },
    {
      name: 'Bookmarks',
      href: routes.app.bookmarks,
      icon: BookmarkIcon,
    },
    {
      name: 'Connections',
      href: routes.app.connections,
      icon: Users2Icon,
    },
    // {
    //   name: "My Collections",
    //   href: "/collections",
    //   icon: Rows3Icon,
    // },
    // {
    //   name: "Stats",
    //   href: "/stats",
    //   icon: CandlestickChart,
    // },

    {
      name: 'Community',
      href: routes.app.community,
      icon: UsersIcon,
    },
    {
      name: 'Settings',
      href: routes.app.settings,
      icon: SettingsIcon,
    },
    {
      name: 'Wallet',
      href: routes.app.wallet.index,
      icon: Wallet2Icon,
    },
  ];

  // const checkIsActive = (pathname: string, isActive?: Array<string>) => {
  //   const splitPath = pathname.split("/");
  //   const basePath = splitPath[1];
  //   return isActive?.includes(basePath);
  // };
  const isActive = (url: string) => path.includes(url);

  return (
    <>
      <div className="border-r border-light h-screen flex flex-col justify-between">
        <div>
          <div className="px-3 pt-3 pb-5 flex justify-end lg:justify-start">
            <Link
              href={routes.home}
              prefetch={true}
              className={`flex items-center gap-x-2`}
            >
              <Icon />
              <p
                className={clsx('text-lg font-black text-primary', {
                  hidden: isLg,
                })}
              >
                <span className="text-dark dark:text-white">Aptos.</span>social
              </p>
            </Link>
          </div>
          <div
            role="button"
            className="pt-3 pb-8 px-3 group flex items-center justify-between pr-5"
          >
            <QuickProfile />
          </div>
          <div>
            {sectionedNavigation.map((section, idx) => (
              <MenuItems key={idx} menu={section.menu} isActive={isActive} />
            ))}
          </div>
        </div>
        <div className="mb-5">
          <div className="hidden lg:flex justify-end xl:justify-start px-[0.8rem] cursor-pointer">
            <MintPost />
          </div>
        </div>
      </div>
    </>
  );
}
