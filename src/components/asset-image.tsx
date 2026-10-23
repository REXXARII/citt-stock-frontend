'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface AssetImageProps {
  src?: string;
  alt: string;
  className: string;
}

export function AssetImage({ src, alt, className }: AssetImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src && failedSrc !== src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          unoptimized
          className="object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div role="img" aria-label={alt} className="flex h-full w-full items-center justify-center bg-linear-to-br from-sky-500/10 to-cyan-500/20 text-sky-600 dark:text-sky-400">
          <Package className="h-10 w-10 stroke-[1.25]" />
        </div>
      )}
    </div>
  );
}
