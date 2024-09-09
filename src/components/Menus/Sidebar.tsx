"use client";

import {
  AtomIcon,
  BanknoteIcon,
  BellDotIcon,
  BookmarkIcon,
  BoxIcon,
  CandlestickChart,
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
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { DexaLogo, Icon } from "../Icons/Icons";
import { routes } from "@/routes";
import clsx from "clsx";
import { useMediaQuery } from "@/hooks/media-query.hook";
import { Button } from "../ui/button";
import { ToggleTheme } from "../ToggleTheme";
import { MintPost } from "../Posts/MintPost";

export default function Sidebar() {
  const isLg = useMediaQuery("(max-width: 1024px)");
  const path = usePathname();
  const [mintModal, setMintModal] = useState<boolean>(false);

  const sectionedNavigation = [
    {
      title: "Home",
      menu: [
        { name: "Feeds", href: routes.home, icon: AtomIcon },
        {
          name: "Explore",
          href: routes.app.explore,
          icon: BoxIcon,
        },
        {
          name: "Bookmarks",
          href: routes.app.bookmarks,
          icon: BookmarkIcon,
        },
      ],
    },
    {
      title: "Chats",
      menu: [
        {
          name: "Connections",
          href: routes.app.connections,
          icon: Users2Icon,
        },
        {
          name: "Messages",
          href: routes.app.messages.index,
          icon: MailIcon,
        },
      ],
    },
    {
      title: "Chats",
      menu: [
        {
          name: "Wallet",
          href: routes.app.wallet.index,
          icon: Wallet2Icon,
        },
        {
          name: "Settings",
          href: routes.app.settings,
          icon: SettingsIcon,
        },
        {
          name: "Community",
          href: routes.app.community,
          icon: UsersIcon,
        },
      ],
    },
  ];

  const navigation = [
    { name: "Feeds", href: routes.home, icon: AtomIcon },
    {
      name: "Explore",
      href: routes.app.explore,
      icon: BoxIcon,
    },
    {
      name: "Messages",
      href: routes.app.messages.index,
      icon: MailIcon,
    },
    // {
    //   name: "Notifications",
    //   href: "/notifications",
    //   icon: BellDotIcon,
    // },
    {
      name: "Bookmarks",
      href: routes.app.bookmarks,
      icon: BookmarkIcon,
    },
    {
      name: "Connections",
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
      name: "Community",
      href: routes.app.community,
      icon: UsersIcon,
    },
    {
      name: "Settings",
      href: routes.app.settings,
      icon: SettingsIcon,
    },
    {
      name: "Wallet",
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
                className={clsx("text-lg font-black text-primary", {
                  hidden: isLg,
                })}
              >
                <span className="text-dark dark:text-white">Aptos.</span>social
              </p>
            </Link>
          </div>
          <div className="pt-3 pb-8 px-3 flex items-center justify-between pr-5">
            <p className="text-dark dark:text-white">Text</p>
            <ToggleTheme />
          </div>
          <div>
            {sectionedNavigation.map((section, idx) => (
              <>
                {section.menu.map((nav, id) => (
                  <Link
                    prefetch={true}
                    href={nav.href}
                    key={idx}
                    className="flex justify-end xl:justify-start group"
                  >
                    <div
                      className={`flex lg:flex-1 items-center justify-between ${
                        isActive(nav.href)
                          ? "bg-primary/10 border-r-4 border-primary"
                          : ""
                      } transition-all duration-200 px-[0.8rem] py-[0.6rem]`}
                    >
                      <div className="flex items-center space-x-5">
                        <nav.icon
                          className={`group-hover:text-primary ${
                            isActive(nav.href)
                              ? "text-primary"
                              : "text-dark dark:text-white"
                          }`}
                          size={23}
                        />
                        <p
                          className={`hidden lg:inline group-hover:text-primary text-base ${
                            isActive(nav.href)
                              ? "text-primary font-bold"
                              : "text-dark dark:text-white"
                          }`}
                        >
                          {nav.name}
                        </p>
                      </div>
                      {isActive(nav.href) && (
                        <DotIcon className="float-right hidden lg:inline text-primary" />
                      )}
                    </div>
                  </Link>
                ))}
                <div className="mb-5 last-of-type:mb-0"></div>
              </>
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
