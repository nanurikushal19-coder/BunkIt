import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  fontSize?: string;
  textColor?: string;
  trackColor?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 100,
  strokeWidth = 8,
  color = '#ffffff', // Default to white
  fontSize = 'text-xl',
  textColor = 'text-white',
  trackColor = '#27272a' // zinc-800
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Logic to determine color: If explicit color is passed, use it.
  // Otherwise, use Red for danger, and the passed color (White) for safe.
  const isSafe = percentage >= 75;
  const strokeColor = isSafe ? color : '#ef4444'; // Red-500 for danger

  return (
    <div className={`relative flex items-center justify-center`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className={`absolute ${fontSize} font-bold ${textColor}`}>
        {percentage.toFixed(2)}%
      </div>
    </div>
  );
};
