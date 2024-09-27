'use client';

import React from 'react';
import { BotMessageSquareIcon } from 'lucide-react';

interface GradientRingProps {
  size?: 'sm' | 'md' | 'lg';
  thickness?: 'thin' | 'normal' | 'thick';
  className?: string;
}

export default function GradientRing({
  size = 'sm',
  thickness = 'normal',
  className = '',
}: GradientRingProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const thicknessClasses = {
    thin: 'ring-2',
    normal: 'ring-4',
    thick: 'ring-8',
  };

  return (
    <div
      className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      {/* Gradient Ring */}
      <div
        className={`
          absolute inset-0
          rounded-full
          bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
          ${thicknessClasses[thickness]}
          ring-offset-2 ring-transparent
          bg-[length:400%_400%]
          animate-gradient-xy
        `}
      ></div>

      <div
        className={`
          absolute inset-0
          rounded-full
          bg-gradient-to-r from-transparent via-white to-transparent
          opacity-30
          animate-spin-slow
        `}
      ></div>

      {/* Center Robot Icon */}
      <BotMessageSquareIcon
        size={23}
        className="relative text-white animate-bounce-thrice"
        aria-hidden="true"
      />
    </div>
  );
}
