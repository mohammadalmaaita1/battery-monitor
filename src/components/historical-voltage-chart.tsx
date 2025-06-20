
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { VoltageHistoryEntry } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface HistoricalVoltageChartProps {
  historyData: VoltageHistoryEntry[];
  isLoading: boolean;
  title?: string;
  cellId?: number | null; // Optional: if charting for a single cell
}

// Define a consistent color palette for cells
const CELL_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))', // Add more if more than 5 cells, though current app is 4
];

export default function HistoricalVoltageChart({ historyData, isLoading, title = "Voltage History Chart", cellId = null }: HistoricalVoltageChartProps) {

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="h-full w-full bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No historical data available to display chart.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for Recharts: group by timestamp, then pivot for cells
  const processedData = historyData.reduce<Record<string, any>>((acc, entry) => {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!acc[timestamp]) {
      acc[timestamp] = { name: timestamp };
    }
    if (entry.voltage !== null) {
       // If charting for a single cell, only include that cell's data
      if (cellId === null || entry.cell === cellId) {
        acc[timestamp][`Cell ${entry.cell}`] = entry.voltage;
      }
    }
    return acc;
  }, {});

  const chartData = Object.values(processedData).sort((a,b) => {
    // Basic time sort, assumes standard time format. Robust sorting would parse time fully.
    return a.name.localeCompare(b.name);
  });

  // Determine which cells have data to render lines for
  const activeCells = new Set<number>();
  historyData.forEach(entry => {
    if (cellId === null || entry.cell === cellId) {
      activeCells.add(entry.cell);
    }
  });
  const cellKeys = Array.from(activeCells).sort((a,b) => a - b).map(c => `Cell ${c}`);


  return (
    <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {cellId ? `Historical voltage readings for Cell ${cellId}.` : `Historical voltage readings for all cells.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={"hsl(var(--border) / 0.5)"} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              stroke="hsl(var(--border))"
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              stroke="hsl(var(--border))"
              label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12, dy: 40 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--popover-foreground))',
                borderRadius: 'var(--radius)',
              }}
              itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '10px' }} />
            {cellKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CELL_COLORS[parseInt(key.split(' ')[1]) -1 % CELL_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2, fill: CELL_COLORS[parseInt(key.split(' ')[1]) -1 % CELL_COLORS.length] }}
                activeDot={{ r: 6 }}
                connectNulls // Handle missing data points gracefully
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

    