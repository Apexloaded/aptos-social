'use client';

import React from 'react';
import BackButton from './back';

type Props = {
  title?: string;
  isBack?: boolean;
  children?: React.ReactNode;
  shiftBtn?: boolean;
};

function Header({ title, isBack = true, children, shiftBtn = false }: Props) {
  return (
    <div className="py-3 sticky z-50 top-0">
      <div
        className={`flex items-center justify-start ${
          shiftBtn ? 'space-x-0' : 'space-x-2'
        } `}
      >
        {isBack && <BackButton shiftBtn={shiftBtn} />}
        <p className="text-xl font-semibold text-dark dark:text-white">
          {title}
        </p>
      </div>
    </div>
  );
}

export default Header;
