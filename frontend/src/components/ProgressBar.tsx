import React from 'react';
import { cn } from '../utils/cn';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
}) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={cn('h-2 rounded-full transition-all duration-300', className)}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

export default ProgressBar;