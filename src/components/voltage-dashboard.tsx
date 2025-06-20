
import BatteryCellCard from '@/components/battery-cell-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CellVoltageReading } from '@/lib/constants';
import { Clock } from 'lucide-react';

interface VoltageDashboardProps {
  voltages: CellVoltageReading[];
  isLoading: boolean;
  numberOfCells: number;
  onCellClick: (cellNumber: number) => void;
  lastUpdatedTimestamp: string | null;
}

export default function VoltageDashboard({ voltages, isLoading, numberOfCells, onCellClick, lastUpdatedTimestamp }: VoltageDashboardProps) {
  
  const renderTimestamp = () => {
    if (!lastUpdatedTimestamp) return null;
    return (
      <div className="text-xs text-muted-foreground flex items-center justify-end mb-2 col-span-full">
        <Clock className="mr-1 h-3 w-3" />
        Live Voltages Last Updated: {lastUpdatedTimestamp}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {renderTimestamp()}
        {Array.from({ length: numberOfCells }).map((_, index) => (
          <div key={index} className="p-4 border rounded-lg shadow bg-card">
            <Skeleton className="h-6 w-1/2 mb-2 bg-muted" />
            <Skeleton className="h-8 w-1/3 mb-3 bg-muted" />
            <Skeleton className="h-10 w-3/4 mb-2 bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const displayCells: CellVoltageReading[] = [];
  for (let i = 0; i < numberOfCells; i++) {
    const cellData = voltages.find(v => v.cell === i + 1);
    if (cellData) {
      displayCells.push(cellData);
    } else {
      // This case should ideally not happen if initialCellVoltages is correctly populated
      displayCells.push({ cell: i + 1, voltage: 0.0, ain_channel: `AIN${i}` });
    }
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
      {renderTimestamp()}
      {displayCells.map((cellData) => (
        <BatteryCellCard
          key={cellData.cell}
          cellNumber={cellData.cell}
          voltage={cellData.voltage}
          onClick={() => onCellClick(cellData.cell)}
        />
      ))}
    </div>
  );
}
