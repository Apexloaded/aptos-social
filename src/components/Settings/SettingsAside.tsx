'use client';

import React, { useState } from 'react';
import { MediaQueryValues, useMediaQuery } from '@/hooks/media-query.hook';
import { cn } from '@/lib/utils';
import { routes } from '@/routes';
import {
  BadgeHelpIcon,
  BookIcon,
  ChevronRightIcon,
  DollarSignIcon,
  LockIcon,
  RssIcon,
  ShieldIcon,
  User2Icon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import {
  openSidebar,
  selectSettingsSidebar,
} from '@/slices/settings/sidebar.slice';
import Link from 'next/link';

const settingsMenu = [
  {
    label: 'Account',
    icon: User2Icon,
    path: routes.app.settings.account,
  },
  {
    label: 'Monetization',
    icon: DollarSignIcon,
    path: routes.app.settings.account,
  },
  {
    label: 'Subscription',
    icon: RssIcon,
    path: routes.app.settings.account,
  },
  {
    label: 'Security and access',
    icon: LockIcon,
    path: routes.app.settings.account,
  },
  {
    label: 'Privacy and safety',
    icon: ShieldIcon,
    path: routes.app.settings.account,
  },
  {
    label: 'Resources',
    icon: BookIcon,
    path: routes.app.settings.account,
  },
  {
    label: 'Help Center',
    icon: BadgeHelpIcon,
    path: routes.app.settings.account,
  },
];

function SettingsAside() {
  const dispatch = useAppDispatch();
  const isXLargeScreen = useMediaQuery(MediaQueryValues.LG);
  const isOpen = useAppSelector(selectSettingsSidebar);

  const toggleSidebar = () => {
    dispatch(openSidebar());
  };

  return (
    <div
      className={cn(
        'w-full lg:w-[20rem] xl:w-[25rem] border-r border-secondary relative bg-white dark:bg-dark',
        isXLargeScreen ? 'w-full' : 'w-4/5',
        isOpen && !isXLargeScreen && 'hidden'
      )}
    >
      <div className="overflow-y-scroll h-screen">
        <header className="sticky top-0">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex space-x-2">
              <p className="text-xl font-semibold dark:text-white">Settings</p>
            </div>
          </div>
        </header>
        <section className="overflow-y-scroll">
          {settingsMenu.map((menu, key) => (
            <Link
              href={menu.path}
              prefetch={true}
              onClick={toggleSidebar}
              key={key}
              className={cn(
                'hover:cursor-pointer block last-of-type:border-none border-b border-secondary dark:border-secondary/40 hover:bg-secondary dark:hover:bg-dark-light py-3 px-4'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <menu.icon size={20} className="dark:text-white" />
                  <p className="text-base dark:text-white">{menu.label}</p>
                </div>
                <ChevronRightIcon
                  size={16}
                  className="text-dark dark:text-white/80"
                />
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export default SettingsAside;
