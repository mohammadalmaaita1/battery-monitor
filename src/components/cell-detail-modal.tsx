
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import HistoricalVoltageChart from "./historical-voltage-chart";
import type { VoltageHistoryEntry, CellVoltageReading, CellStatus } from "@/lib/constants";
import { getVoltageStatus, statusStyles } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CellDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cellNumber: number | null;
  currentCellReading: CellVoltageReading | undefined; // Current voltage and AIN for the selected cell
  historyData: VoltageHistoryEntry[];
}

export default function CellDetailModal({ isOpen, onClose, cellNumber, currentCellReading, historyData }: CellDetailModalProps) {
  if (!isOpen || cellNumber === null) {
    return null;
  }

  const cellHistory = historyData.filter(entry => entry.cell === cellNumber);

  let minVoltage: number | null = null;
  let maxVoltage: number | null = null;
  let sumVoltage = 0;
  let count = 0;

  cellHistory.forEach(entry => {
    if (entry.voltage !== null) {
      if (minVoltage === null || entry.voltage < minVoltage) {
        minVoltage = entry.voltage;
      }
      if (maxVoltage === null || entry.voltage > maxVoltage) {
        maxVoltage = entry.voltage;
      }
      sumVoltage += entry.voltage;
      count++;
    }
  });

  const avgVoltage = count > 0 ? sumVoltage / count : null;

  const currentVoltage = currentCellReading?.voltage ?? null;
  const status: CellStatus = getVoltageStatus(currentVoltage);
  const currentStatusStyles = statusStyles[status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Cell {cellNumber} - Detailed View</DialogTitle>
              <DialogDescription>
                In-depth voltage history and current status for Cell {cellNumber}.
              </DialogDescription>
            </div>
            {currentCellReading && (
                 <div className="text-right space-y-1">
                    <div className="text-xl font-semibold">
                        Current: {currentVoltage !== null ? `${currentVoltage.toFixed(2)}V` : 'N/A'}
                    </div>
                    <Badge className={cn("capitalize py-1 px-2 text-xs", currentStatusStyles.badgeBackgroundClass, currentStatusStyles.textClass)}>
                        {currentStatusStyles.name}
                    </Badge>
                 </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-4 flex-grow overflow-y-auto min-h-0">
          {cellHistory.length > 0 ? (
            <>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-muted-foreground">Min Voltage (Chart):</p>
                  <p className="font-semibold text-lg">{minVoltage !== null ? `${minVoltage.toFixed(2)}V` : 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-muted-foreground">Max Voltage (Chart):</p>
                  <p className="font-semibold text-lg">{maxVoltage !== null ? `${maxVoltage.toFixed(2)}V` : 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-muted-foreground">Avg Voltage (Chart):</p>
                  <p className="font-semibold text-lg">{avgVoltage !== null ? `${avgVoltage.toFixed(2)}V` : 'N/A'}</p>
                </div>
              </div>
              <div className="h-[40vh] sm:h-[50vh] lg:h-[60vh]">
                 <HistoricalVoltageChart
                    historyData={cellHistory}
                    isLoading={false} 
                    title={`Voltage History for Cell ${cellNumber}`}
                    cellId={cellNumber}
                 />
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-10">No historical data available for Cell {cellNumber}.</p>
          )}
        </div>
        <DialogFooter className="p-6 pt-2 border-t">
            <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
