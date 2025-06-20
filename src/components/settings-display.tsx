
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Info } from 'lucide-react';
import { DEFAULT_VOLTAGE_THRESHOLDS, CUSTOM_THRESHOLDS_LOCAL_STORAGE_KEY, type VoltageThresholds } from '@/lib/constants';

const LIVE_UPDATE_INTERVAL_KEY = 'batterySensei_liveUpdateInterval';
const DEFAULT_LIVE_UPDATE_INTERVAL_SECONDS = 1; // Default to 1s for SSE

export default function SettingsDisplay() {
  const [liveUpdateIntervalSeconds, setLiveUpdateIntervalSeconds] = useState<number>(DEFAULT_LIVE_UPDATE_INTERVAL_SECONDS);
  const [customThresholds, setCustomThresholds] = useState<VoltageThresholds>(DEFAULT_VOLTAGE_THRESHOLDS);
  const { toast } = useToast();

  useEffect(() => {
    const storedInterval = localStorage.getItem(LIVE_UPDATE_INTERVAL_KEY);
    if (storedInterval) {
      const parsedInterval = parseInt(storedInterval, 10);
      if (!isNaN(parsedInterval) && parsedInterval > 0) {
        setLiveUpdateIntervalSeconds(parsedInterval);
      }
    }

    const storedThresholds = localStorage.getItem(CUSTOM_THRESHOLDS_LOCAL_STORAGE_KEY);
    if (storedThresholds) {
      try {
        const parsed = JSON.parse(storedThresholds);
        if (
          typeof parsed.CRITICAL_LOW_CUTOFF === 'number' &&
          typeof parsed.WARNING_LOW_CUTOFF === 'number' &&
          typeof parsed.NORMAL_MAX_CUTOFF === 'number' &&
          typeof parsed.WARNING_HIGH_CUTOFF === 'number'
        ) {
          setCustomThresholds(parsed);
        } else {
          setCustomThresholds(DEFAULT_VOLTAGE_THRESHOLDS);
          localStorage.setItem(CUSTOM_THRESHOLDS_LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_VOLTAGE_THRESHOLDS));
        }
      } catch {
        setCustomThresholds(DEFAULT_VOLTAGE_THRESHOLDS);
        localStorage.setItem(CUSTOM_THRESHOLDS_LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_VOLTAGE_THRESHOLDS));
      }
    } else {
        localStorage.setItem(CUSTOM_THRESHOLDS_LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_VOLTAGE_THRESHOLDS));
    }
  }, []);

  const handleIntervalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (event.target.value === "" || (!isNaN(value) && value > 0)) {
      setLiveUpdateIntervalSeconds(value > 0 ? value : 0);
    }
  };

  const handleThresholdChange = (event: ChangeEvent<HTMLInputElement>, field: keyof VoltageThresholds) => {
    const value = parseFloat(event.target.value);
    if (event.target.value === "" || !isNaN(value)) {
      setCustomThresholds(prev => ({
        ...prev,
        [field]: event.target.value === "" ? 0 : value // Store 0 if empty, then validate on save
      }));
    }
  };

  const handleSaveSettings = () => {
    // Validate Live Update Interval
    if (liveUpdateIntervalSeconds <= 0 && liveUpdateIntervalSeconds !== 0) { // allow 0 for empty string case before validation
        toast({
            variant: "destructive",
            title: "Invalid Interval",
            description: "Live update interval (for SSE) must be a positive number.",
        });
        return;
    }
    localStorage.setItem(LIVE_UPDATE_INTERVAL_KEY, liveUpdateIntervalSeconds.toString());

    // Validate Thresholds
    const { CRITICAL_LOW_CUTOFF, WARNING_LOW_CUTOFF, NORMAL_MAX_CUTOFF, WARNING_HIGH_CUTOFF } = customThresholds;
    if (!(CRITICAL_LOW_CUTOFF < WARNING_LOW_CUTOFF && WARNING_LOW_CUTOFF < NORMAL_MAX_CUTOFF && NORMAL_MAX_CUTOFF < WARNING_HIGH_CUTOFF)) {
        toast({
            variant: "destructive",
            title: "Invalid Threshold Logic",
            description: "Thresholds must be in logical ascending order: Critical Low < Warning Low < Normal Max < Warning High.",
        });
        return;
    }
    localStorage.setItem(CUSTOM_THRESHOLDS_LOCAL_STORAGE_KEY, JSON.stringify(customThresholds));

    toast({
      title: "Settings Saved",
      description: `Settings have been saved to your browser. Changes will apply on next data evaluation or page refresh.`,
    });
    // Force a re-render or state update in other components might be needed for immediate effect without refresh.
    // For now, a refresh is the simplest way to see voltage status color changes.
    window.location.reload(); // Simplest way to make constants re-evaluate with new localStorage values
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><SettingsIcon className="mr-2 h-5 w-5"/>Frontend Behavior Settings</CardTitle>
          <CardDescription>Customize how the frontend application behaves. These settings are stored in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="liveUpdateInterval">Live Update Stream Interval (seconds)</Label>
            <Input
              id="liveUpdateInterval"
              type="number"
              value={liveUpdateIntervalSeconds === 0 ? "" : liveUpdateIntervalSeconds}
              onChange={handleIntervalChange}
              min="1"
              className="max-w-xs mt-1"
              placeholder={`Default: ${DEFAULT_LIVE_UPDATE_INTERVAL_SECONDS}s`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This sets the `time.sleep()` interval in the backend SSE stream. A page refresh is typically needed for this to take effect on the backend loop.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Custom Voltage Thresholds (V)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="criticalLow">Critical Low Cutoff</Label>
                    <Input id="criticalLow" type="number" step="0.01" value={customThresholds.CRITICAL_LOW_CUTOFF} onChange={(e) => handleThresholdChange(e, 'CRITICAL_LOW_CUTOFF')} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="warningLow">Warning Low Cutoff</Label>
                    <Input id="warningLow" type="number" step="0.01" value={customThresholds.WARNING_LOW_CUTOFF} onChange={(e) => handleThresholdChange(e, 'WARNING_LOW_CUTOFF')} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="normalMax">Normal Max Cutoff</Label>
                    <Input id="normalMax" type="number" step="0.01" value={customThresholds.NORMAL_MAX_CUTOFF} onChange={(e) => handleThresholdChange(e, 'NORMAL_MAX_CUTOFF')} className="mt-1" />
                </div>
                <div>
                    <Label htmlFor="warningHigh">Warning High Cutoff</Label>
                    <Input id="warningHigh" type="number" step="0.01" value={customThresholds.WARNING_HIGH_CUTOFF} onChange={(e) => handleThresholdChange(e, 'WARNING_HIGH_CUTOFF')} className="mt-1" />
                </div>
            </div>
             <p className="text-xs text-muted-foreground mt-1">
              Define voltage ranges for status indicators. Ensure logical order. Changes apply after saving and page refresh.
            </p>
          </div>

          <Button onClick={handleSaveSettings}>Save Frontend Settings</Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Backend Configuration</CardTitle>
          <CardDescription>
            Information about the backend system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
                The system must be connected to the Raspberry Pi in order to enable data transmission from the physical battery hardware. This connection allows voltage and status data to be downloaded into the cells and displayed in real-time within the interface.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

