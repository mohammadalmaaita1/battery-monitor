
'use client';

import type { CellStatus } from '@/lib/constants';
import { statusStyles } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BatteryLevelDisplayProps {
  levelPercent: number;
  status: CellStatus;
}

export default function BatteryLevelDisplay({ levelPercent, status }: BatteryLevelDisplayProps) {
  const styles = statusStyles[status];

  // Ensure levelPercent is between 0 and 100
  const fillWidthPercent = Math.max(0, Math.min(100, levelPercent));

  return (
    <div 
      className="flex justify-center my-3" 
      aria-label={`Battery level: ${fillWidthPercent.toFixed(0)}%, status: ${styles.name}`}
    >
      <div className="w-[70px] h-[34px] border-2 border-foreground/70 dark:border-foreground/40 rounded-[3px] relative p-0.5 bg-background/30 shadow-inner">
        {/* Battery Fill Level */}
        <div
          className={cn(
            "h-full rounded-[1px] transition-all duration-500 ease-in-out",
            styles.fillClass
          )}
          style={{ width: `${fillWidthPercent}%` }}
        />
        {/* Battery Terminal */}
        <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-[6px] h-[14px] bg-foreground/70 dark:bg-foreground/40 rounded-r-[2px] rounded-l-sm shadow-sm" />
      </div>
    </div>
  );
}
