'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { BLURURL } from '@/config/constants';

interface OptimizedImageProps extends Omit<ImageProps, 'height' | 'width'> {
  aspectRatio?: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  containerClassName?: string;
  fillContainer?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  aspectRatio,
  width,
  height,
  containerClassName,
  className,
  sizes = '(min-width: 1280px) 50vw, (min-width: 768px) 75vw, 100vw',
  quality = 75,
  priority = false,
  placeholder = 'blur',
  blurDataURL = BLURURL,
  fillContainer = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setLoading] = useState(true);

  const containerStyle: React.CSSProperties = {
    aspectRatio: aspectRatio,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (!width && !height && !aspectRatio) {
    containerStyle.width = '100%';
    containerStyle.height = 'auto';
  }

  return (
    <Image
      className={cn(
        'duration-700 ease-in-out',
        isLoading
          ? 'scale-110 blur-2xl grayscale'
          : 'scale-100 blur-0 grayscale-0',
        fillContainer ? 'object-cover' : 'object-contain',
        className
      )}
      src={src}
      alt={alt}
      fill={fillContainer}
      width={!fillContainer ? width : undefined}
      height={!fillContainer ? height : undefined}
      sizes={sizes}
      quality={quality}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoadingComplete={() => setLoading(false)}
      {...props}
    />
  );
}
