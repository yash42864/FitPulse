import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'lime' | 'violet' | 'none';
}

export const Card: React.FC<CardProps> = ({
  className,
  glow = 'none',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-[#1C2435] border border-[#273349] rounded-2xl p-5 shadow-card-dark transition-all duration-200',
        glow === 'lime' && 'hover:border-lime-accent/50 hover:shadow-glow-lime',
        glow === 'violet' && 'hover:border-violet-accent/50 hover:shadow-glow-violet',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
