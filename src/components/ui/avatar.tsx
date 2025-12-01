'use client';

import * as React from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { cn } from '@/lib/utils';
import { sanitizeSvg } from '@/lib/sanitize';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 40, className, ...props }: AvatarProps) {
  const [avatarSvg, setAvatarSvg] = React.useState<string>('');

  React.useEffect(() => {
    const avatar = createAvatar(avataaars, {
      seed: name,
      size,
      // Customize the avatar style
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9'],
      radius: 50,
    });

    // Sanitize SVG content to prevent XSS
    setAvatarSvg(sanitizeSvg(avatar.toString()));
  }, [name, size]);

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-secondary',
        className
      )}
      style={{ width: size, height: size }}
      {...props}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
    />
  );
}
