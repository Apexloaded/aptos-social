'use client';

import React, { useRef } from 'react';
import useClipBoard from '@/hooks/clipboard.hook';
import { CheckCheck, WalletIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { formatWalletAddress } from '@/utils/helpers';

interface CopyLinkProps {
  href: string;
  textToCopy: string;
}
export default function CopyLink({ textToCopy, href }: CopyLinkProps) {
  const { isCopied, copy } = useClipBoard();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const copyDuration = 500; // Duration to hold for copy in milliseconds

  const startCopyTimer = () => {
    timerRef.current = setTimeout(() => {
      copy(textToCopy);
    }, copyDuration);
  };

  const clearCopyTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handlePress = () => {
    clearCopyTimer();
    startCopyTimer();
  };

  const handleRelease = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    clearCopyTimer();
    // If the button wasn't held long enough, navigate
    if (!isCopied) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <WalletIcon size={18} className="text-dark/70 dark:text-white/80" />
      <Button
        variant="link"
        className="inline-flex items-center gap-2 p-0 h-auto hover:no-underline"
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={clearCopyTimer}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
        onTouchCancel={clearCopyTimer}
      >
        {formatWalletAddress(textToCopy)}
      </Button>
      {isCopied && <CheckCheck size={16} className="text-primary" />}
    </div>
  );
}
