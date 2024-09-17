
import Link from 'next/link';
import { MenuOptions } from '@/interfaces/menu.interface';
import { DotIcon } from 'lucide-react';

type Props = {
  menu: MenuOptions[];
  isActive: (url: string) => boolean;
};
export function MenuItems({ isActive, menu }: Props) {
  return (
    <>
      {menu.map((nav, id) => (
        <Link
          prefetch={true}
          href={nav.href}
          key={id}
          className="flex justify-end xl:justify-start group"
        >
          <div
            className={`flex lg:flex-1 items-center justify-between ${
              isActive(nav.href)
                ? 'bg-primary/10 border-r-4 border-primary'
                : ''
            } transition-all duration-200 px-[0.8rem] py-[0.6rem]`}
          >
            <div className="flex items-center space-x-5">
              <nav.icon
                className={`group-hover:text-primary ${
                  isActive(nav.href)
                    ? 'text-primary'
                    : 'text-dark dark:text-white'
                }`}
                size={23}
              />
              <p
                className={`hidden lg:inline group-hover:text-primary text-base ${
                  isActive(nav.href)
                    ? 'text-primary font-bold'
                    : 'text-dark dark:text-white'
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
  );
}
