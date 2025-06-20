
'use client';

import type { CellStatus } from '@/lib/constants';
import { getVoltageStatus, statusStyles, getBatteryLevelPercent } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import BatteryLevelDisplay from './battery-level-display';

interface BatteryCellCardProps {
  cellNumber: number;
  voltage: number | null; // Can be null if backend sends null
  onClick?: () => void;
}

export default function BatteryCellCard({ cellNumber, voltage, onClick }: BatteryCellCardProps) {
  // If voltage is null, treat it as 0.0V for status and display purposes
  const displayVoltage = voltage === null ? 0.0 : voltage;

  const status: CellStatus = getVoltageStatus(displayVoltage); // Use displayVoltage for status
  const styles = statusStyles[status];
  const levelPercent = getBatteryLevelPercent(displayVoltage); // Use displayVoltage for level

  // If status is critical-error, determine if it's due to low or high voltage for the description.
  let refinedDescription = styles.description;
  if (status === 'critical-error') {
    if (displayVoltage < 3.2) { // Using the threshold from constants
      refinedDescription = "Voltage is critically low!";
    } else if (displayVoltage > 4.25) { // Using threshold from constants
      refinedDescription = "Voltage is critically high!";
    }
  }
  // If voltage was originally null and now shown as 0.0V, and status is critical-error due to low voltage,
  // it might be more accurate to say "No reading" or "Unconnected" if we could distinguish.
  // For now, it will show "Critically low" if displayVoltage (0.0) is used.
  // If voltage was null and is displayed as 0.0V, refine description
  if (voltage === null && displayVoltage === 0.0) {
    refinedDescription = "No reading or unconnected.";
  }


  return (
    <Card
      className={cn(
        "shadow-lg transition-all duration-300 ease-in-out flex flex-col justify-between",
        styles.borderClass,
        voltage === null ? 'opacity-80' : '', // Slightly dim if original voltage was null
        onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-foreground">Cell {cellNumber}</CardTitle>
        <Badge className={cn("capitalize py-1 px-2 text-xs", styles.badgeBackgroundClass, styles.textClass)}>
          {styles.name}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-0">
        <div className="text-3xl font-bold text-foreground mb-1">
          {/* Display displayVoltage (which is 0.0 for null original voltage) */}
          {`${displayVoltage.toFixed(2)}V`} 
        </div>
        <BatteryLevelDisplay levelPercent={levelPercent} status={status} />
        <p className="text-xs text-muted-foreground mt-1 text-center h-8 leading-tight px-1">
          {refinedDescription}
        </p>
      </CardContent>
    </Card>
  );
}


    