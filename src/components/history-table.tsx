import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { VoltageHistoryEntry } from '@/lib/constants';

interface HistoryTableProps {
  data: VoltageHistoryEntry[];
  isLoading: boolean;
}

export default function HistoryTable({ data, isLoading }: HistoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Cell</TableHead>
              <TableHead>Voltage (V)</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border shadow-md">
      <Table>
        <TableCaption className="py-4">{data.length === 0 ? 'No historical data available.' : 'A list of recent voltage readings.'}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Cell</TableHead>
            <TableHead>Voltage (V)</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry, index) => (
            <TableRow key={`${entry.timestamp}-${entry.cell}-${index}`}>
              <TableCell className="font-medium">{entry.cell}</TableCell>
              <TableCell>{entry.voltage.toFixed(2)}</TableCell>
              <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
