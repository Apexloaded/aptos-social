'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/auth.context';
import {
  BookmarkIcon,
  ChevronDownIcon,
  DatabaseIcon,
  HelpCircleIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { ToggleTheme } from '../ToggleTheme';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useTheme } from '@/context/theme.context';
import Switch from '../ui/switch';
import { routes } from '@/routes';

export default function QuickProfile() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild className="w-full">
        <div className="flex items-center gap-x-2 flex-1 justify-between">
          <div className="flex items-center gap-x-2">
            <div className="rounded-full border bg-muted overflow-hidden">
              {user?.pfp ? (
                <Image
                  src={`${user?.pfp}`}
                  height={400}
                  width={400}
                  alt="pfp"
                  className="h-12 w-12"
                  priority={true}
                />
              ) : (
                <div></div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-dark group-hover:text-primary dark:text-white font-medium">
                {user?.name}
              </p>
              <p className="dark:text-white text-sm -mt-1 text-dark/45">
                @{user?.username}
              </p>
            </div>
          </div>
          <ChevronDownIcon
            size={18}
            className="group-hover:text-primary dark:text-white"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={5}
        className="bg-white dark:bg-dark-light shadow-2xl overflow-hidden border-none w-60 p-0"
      >
        <div className="flex flex-col py-2">
          <Link
            prefetch={true}
            href={routes.app.profile(`${user?.username}`)}
            className="hover:bg-muted dark:hover:bg-dark px-4 py-3"
          >
            <div className="flex items-center gap-3 text-dark dark:text-white">
              <UserIcon size={20} />
              <p>Profile</p>
            </div>
          </Link>
          <Link href={routes.app.bookmarks} className="hover:bg-muted dark:hover:bg-dark px-4 py-3">
            <div className="flex items-center gap-3 text-dark dark:text-white">
              <BookmarkIcon size={20} />
              <p>Bookmarks</p>
            </div>
          </Link>
        </div>
        <div className="border-t flex flex-col py-2">
          {/* <Link href="" className="hover:bg-muted dark:hover:bg-dark px-4 py-3">
            <div className="flex items-center gap-3 text-dark dark:text-white">
              <SettingsIcon size={20} />
              <p>Settings</p>
            </div>
          </Link> */}
          <div
            role="button"
            className="hover:bg-muted dark:hover:bg-dark px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-dark dark:text-white">
              <MoonIcon size={20} />
              <p>Dark Mode</p>
            </div>
            <Switch
              type="checkbox"
              checked={theme == 'dark'}
              onChange={toggleTheme}
              className="cursor-pointer"
            />
          </div>
        </div>
        <div className="border-t flex flex-col py-2">
          {/* <Link href="" className="hover:bg-muted dark:hover:bg-dark px-4 py-3">
            <div className="flex items-center gap-3 text-dark dark:text-white">
              <HelpCircleIcon size={20} />
              <p>Support</p>
            </div>
          </Link> */}
          <div
            role="button"
            onClick={logout}
            className="hover:bg-muted dark:hover:bg-dark px-4 py-3"
          >
            <div className="flex items-center gap-3 text-dark dark:text-white">
              <LogOutIcon size={20} />
              <p>Log out</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
