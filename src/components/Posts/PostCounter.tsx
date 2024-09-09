import React from "react";

export default function PostCounter({
  className,
  progress,
  showText = true,
}: React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  progress: number;
  showText?: boolean;
}) {
  const size = 35,
    trackWidth = 3,
    indicatorWidth = 3,
    indicatorCap = `round`;

  const center = size / 2;
  const radius =
    center - (trackWidth > indicatorWidth ? trackWidth : indicatorWidth);
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = progress < 100 ? dashArray * ((100 - progress) / 100) : 0;

  return (
    <div className="inline-flex items-center justify-center relative overflow-hidden rounded-full">
      <svg style={{ width: size, height: size }}>
        <circle
          className="text-accent dark:text-accent/50"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={trackWidth}
        />
        <circle
          className={`${className} ${
            progress > 100 ? "text-danger" : "text-primary"
          } `}
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={indicatorWidth}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap={indicatorCap}
        />
      </svg>
      {showText && (
        <span className="absolute text-primary text-[.5rem]">{progress}%</span>
      )}
    </div>
  );
}
