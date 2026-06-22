import React from 'react';

const Avatar = ({
  name = '',
  size = 'md', // 'sm' (24px), 'md' (32px), 'lg' (40px)
  isOnline = false,
  showPresence = false,
  className = '',
  ...props
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '?';

  const sizes = {
    sm: 'h-6 w-6 text-[9px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  const presenceDotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  // Generate consistent background color based on name hash
  const colors = [
    'bg-[#3b82f6]', // Blue
    'bg-[#8b5cf6]', // Purple
    'bg-[#10b981]', // Emerald
    'bg-[#f59e0b]', // Amber
    'bg-[#ec4899]', // Pink
    'bg-[#6366f1]', // Indigo
  ];

  const getColor = (str) => {
    if (!str) return colors[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const bgClass = getColor(name);

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div
        className={`flex items-center justify-center rounded-full font-bold uppercase text-white shadow-sm ring-1 ring-background/10 select-none ${sizes[size]} ${bgClass}`}
        title={name}
      >
        {initials}
      </div>
      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-[#030712] ${
            isOnline ? 'bg-success animate-pulse' : 'bg-textSecondary'
          } ${presenceDotSizes[size]}`}
        />
      )}
    </div>
  );
};

export default Avatar;
