import React from 'react';

interface AppleEmojiProps {
  emoji: string;
  className?: string;
  alt?: string;
}

export function AppleEmoji({
  emoji,
  className = '',
  alt = '',
}: AppleEmojiProps) {
  if (!emoji) return null;

  return (
    <img
      src={`https://emojicdn.elk.sh/${emoji}?style=apple`}
      className={className}
      alt={alt || emoji}
    />
  );
}
