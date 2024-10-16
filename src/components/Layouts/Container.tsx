'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../Menus/Sidebar';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectSidebar } from '@/slices/sidebar/sidebar.slice';
import { usePathname } from 'next/navigation';
import { fullScreenPath } from '@/routes';

function Container({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  const pathname = usePathname();
  const isSidebar = useAppSelector(selectSidebar);
  const [isFullScreenPath, setIsFullScreenPath] = useState<boolean>(false);

  useEffect(() => {
    if (pathname) {
      const isFull = fullScreenPath.includes(pathname);
      setIsFullScreenPath(isFull);
    }
  }, [pathname]);

  return (
    <div
      className={`${
        !isSidebar ? 'w-full' : 'max-w-7xl'
      }  mx-auto bg-white dark:bg-dark`}
    >
      <div className="flex flex-col justify-between xs:justify-start xs:flex-row h-svh overflow-hidden relative overscroll-contain">
        {!isFullScreenPath && (
          <div
            className={`hidden ${
              !isSidebar ? 'xs:hidden' : 'xs:inline'
            }  md:w-1/5`}
          >
            <Sidebar />
          </div>
        )}
        <div className="flex-1 w-full lg:w-4/5 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export default Container;
