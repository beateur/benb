'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  fallbackUrl?: string;  // URL spécifique pour le fallback
}

export default function Image({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  quality = 80,
  onLoad,
  fallbackUrl,
  ...props
}: ImageProps & Omit<React.HTMLProps<HTMLImageElement>, 'src' | 'width' | 'height' | 'loading' | 'ref' | 'alt' | 'onLoad'>) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine fallback format (use provided fallbackUrl or generate from src)
  const fallbackSrc = fallbackUrl || src.replace('.avif', '.png');

  // Handle load completion
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  // Handle error
  const handleError = () => {
    setError(true);
  };

  return (
    <div className={cn("relative overflow-hidden", className, {
      "w-full h-full": fill,
    })}>
      {/* Show skeleton during loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Try AVIF first */}
      {!error ? (
        <img
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={cn(
            "transition-opacity duration-300", 
            fill ? "object-cover w-full h-full" : "",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      ) : (
        // Fallback to PNG if AVIF fails
        <img
          src={fallbackSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={cn(
            "transition-opacity duration-300", 
            fill ? "object-cover w-full h-full" : "",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      )}
    </div>
  );
}
