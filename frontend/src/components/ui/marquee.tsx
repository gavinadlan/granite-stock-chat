import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  speed?: number;
}

export function Marquee({ 
  children, 
  className = '', 
  pauseOnHover = true, 
  speed = 30 
}: MarqueeProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div 
        className={`marquee-container ${pauseOnHover ? 'hover:animate-pause' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}

interface MarqueeItemProps {
  children: React.ReactNode;
  className?: string;
}

export function MarqueeItem({ children, className = '' }: MarqueeItemProps) {
  return (
    <div className={`marquee-item ${className}`}>
      {children}
    </div>
  );
}
