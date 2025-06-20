
'use client';

import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import Header from '@/components/layout/header';
import VoltageDashboard from '@/components/voltage-dashboard';
import HistoryTable from '@/components/history-table';
import DiagnosticReportSection from '@/components/diagnostic-report-section';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Brain, TrendingUp, AlertCircle, Lightbulb, Zap, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  FLASK_API_BASE_URL,
  NUMBER_OF_CELLS,
  type CellVoltageReading,
  type VoltageHistoryEntry,
  type BackendDashboardStats,
  type AverageVoltagePerCell,
  initialCellVoltages,
  type PredictiveAlert,
  type RecentCellHistory,
} from '@/lib/constants';
import { getAIDiagnosticReport, getAIOptimalUsageAdvice, getAIPredictiveAlerts } from '@/app/actions';
import type { GenerateBatteryDiagnosticReportOutput } from '@/ai/flows/generate-battery-diagnostic-report';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import HistoricalVoltageChart from './historical-voltage-chart';
import CellDetailModal from './cell-detail-modal';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import ElectricLoadingAnimation from './electric-loading-animation';


export type ConnectionStatus = 'connected' | 'connecting' | 'error' | 'initial' | 'polling' | 'streaming';


export default function BatteryMonitor() {
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);
  const [cellVoltages, setCellVoltages] = useState<CellVoltageReading[]>(initialCellVoltages);
  const [history, setHistory] = useState<VoltageHistoryEntry[]>([]);
  
  const [diagnosticReportData, setDiagnosticReportData] = useState<GenerateBatteryDiagnosticReportOutput | null>(null);
  const [userAiContextDiagnostics, setUserAiContextDiagnostics] = useState<string>("");
  const [isGeneratingDiagnostics, startDiagnosticGeneration] = useTransition();

  const [optimalAdvice, setOptimalAdvice] = useState<string | null>(null);
  const [userAiContextAdvice, setUserAiContextAdvice] = useState<string>("");
  const [isGeneratingAdvice, startAdviceGeneration] = useTransition();
  
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [isGeneratingPredAlerts, startPredAlertGeneration] = useTransition();

  const [isLoadingFullData, setIsLoadingFullData] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); 
  const [isLoadingStats, setIsLoadingStats] = useState(true); 
  const [dashboardStats, setDashboardStats] = useState<BackendDashboardStats | null>(null);
  const [dashboardLastUpdated, setDashboardLastUpdated] = useState<string | null>(null);
  const [liveVoltagesLastUpdated, setLiveVoltagesLastUpdated] = useState<string | null>(null);


  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('initial');
  const eventSourceRef = useRef<EventSource | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCellForModal, setSelectedCellForModal] = useState<number | null>(null);

  const { toast } = useToast();

  const checkApiUrl = useCallback(() => {
    if (!FLASK_API_BASE_URL || FLASK_API_BASE_URL.trim() === '') {
      const errorMsg = "CRITICAL: FLASK_API_BASE_URL is not configured. The application cannot fetch data.";
      console.error(errorMsg);
      toast({
        variant: "destructive",
        title: "API URL Not Configured",
        description: "Backend API URL is missing. Update on Settings page or environment.",
        duration: 15000,
      });
      setConnectionStatus('error');
      return false;
    }
    return true;
  }, [toast]);

  const updateFrontendVoltages = useCallback((backendReadings: CellVoltageReading[] | undefined) => {
    setCellVoltages(prevCellVoltages => {
      const newCellVoltagesState: CellVoltageReading[] = Array.from({ length: NUMBER_OF_CELLS }, (_, i) => ({
        cell: i + 1,
        voltage: 0.0, 
        ain_channel: `AIN${i}`
      }));

      if (Array.isArray(backendReadings)) {
        backendReadings.forEach(reading => {
          if (reading.cell >= 1 && reading.cell <= NUMBER_OF_CELLS) {
            newCellVoltagesState[reading.cell - 1] = {
              ...newCellVoltagesState[reading.cell - 1],
              cell: reading.cell,
              voltage: typeof reading.voltage === 'number' ? reading.voltage : 0.0, 
              ain_channel: reading.ain_channel || `AIN${reading.cell -1}`
            };
          }
        });
      }
      
      if (JSON.stringify(newCellVoltagesState) === JSON.stringify(prevCellVoltages)) {
        return prevCellVoltages;
      }
      setLiveVoltagesLastUpdated(new Date().toLocaleTimeString());
      return newCellVoltagesState;
    });
  }, []);


  const fetchFullData = useCallback(async (isManualRefresh = false) => {
    if (!checkApiUrl()) {
      setIsLoadingFullData(false);
      setIsLoadingHistory(false);
      setIsLoadingStats(false);
      updateFrontendVoltages(initialCellVoltages);
      setHistory([]);
      setDashboardStats(null);
      setDashboardLastUpdated(new Date().toLocaleTimeString());
      return;
    }

    if (isManualRefresh || isLoadingFullData) { 
        setIsLoadingFullData(true); 
        setIsLoadingHistory(true);
        setIsLoadingStats(true);
    }
    if(!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
      setConnectionStatus('connecting'); 
    }

    const voltageApiUrl = `${FLASK_API_BASE_URL}/api/voltage`;
    const historyApiUrl = `${FLASK_API_BASE_URL}/api/history`;
    const dashboardApiUrl = `${FLASK_API_BASE_URL}/api/dashboard`;

    try {
      const [voltageRes, historyRes, dashboardRes] = await Promise.all([
        fetch(voltageApiUrl).catch(e => { console.error(`Fetch /api/voltage failed: ${e}`); return { ok: false, statusText: e.message, json: async () => ({ message: e.message }) }; }),
        fetch(historyApiUrl).catch(e => { console.error(`Fetch /api/history failed: ${e}`); return { ok: false, statusText: e.message, json: async () => ({ message: e.message }) }; }),
        fetch(dashboardApiUrl).catch(e => { console.error(`Fetch /api/dashboard failed: ${e}`); return { ok: false, statusText: e.message, json: async () => ({ message: e.message }) }; }),
      ]);

      if (voltageRes.ok) {
        const voltageData = await voltageRes.json();
        if (voltageData.status === 'success' && Array.isArray(voltageData.readings)) {
          updateFrontendVoltages(voltageData.readings);
        } else {
          updateFrontendVoltages(initialCellVoltages);
        }
      } else {
        updateFrontendVoltages(initialCellVoltages);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (Array.isArray(historyData)) {
         setHistory(historyData.map((item: any) => ({
            ...item,
            voltage: typeof item.voltage === 'number' ? item.voltage : null,
            timestamp: item.timestamp || new Date().toISOString() 
          })));
        } else {
          setHistory([]);
        }
      } else {
         setHistory([]);
      }
      setIsLoadingHistory(false);
      
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        if (dashboardData.status === 'success') {
          setDashboardStats({
            ...dashboardData,
            average_voltages_per_cell: Array.isArray(dashboardData.average_voltages_per_cell) ? dashboardData.average_voltages_per_cell : [],
          });
        } else {
           setDashboardStats(null);
        }
      } else {
        setDashboardStats(null);
      }
      setIsLoadingStats(false);
      setDashboardLastUpdated(new Date().toLocaleTimeString());

    } catch (error) { 
      const originalErrorMessage = error instanceof Error ? error.message : "An unknown network error occurred during full data load";
      updateFrontendVoltages(initialCellVoltages);
      setHistory([]);
      setDashboardStats(null);
      setDashboardLastUpdated(new Date().toLocaleTimeString());
      toast({
        variant: "destructive",
        title: "Initial Data Load Failed", 
        description: `${originalErrorMessage}. Ensure backend is running and accessible.`,
        duration: 7000,
      });
    } finally {
      setIsLoadingFullData(false); 
    }
  }, [checkApiUrl, updateFrontendVoltages, toast, isLoadingFullData]);


  useEffect(() => {
    if (showIntroAnimation) return; 

    if (!checkApiUrl()) {
      setIsLoadingFullData(false); setIsLoadingHistory(false); setIsLoadingStats(false);
      updateFrontendVoltages(initialCellVoltages); setHistory([]); setDashboardStats(null);
      setDashboardLastUpdated(new Date().toLocaleTimeString());
      return;
    }

    if (eventSourceRef.current) eventSourceRef.current.close();
    
    const sseApiUrl = `${FLASK_API_BASE_URL}/api/voltage/stream`;
    setConnectionStatus('connecting'); 
    const newEventSource = new EventSource(sseApiUrl);
    eventSourceRef.current = newEventSource;

    newEventSource.onopen = () => {
      setConnectionStatus('streaming'); 
      toast({ title: "Live Connection Active", description: "Receiving real-time voltage updates.", duration: 3000 });
    };

    newEventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        if (eventData.status === 'success' && Array.isArray(eventData.readings)) {
          updateFrontendVoltages(eventData.readings);
          if (connectionStatus !== 'streaming') setConnectionStatus('streaming');
        } else if (eventData.status === 'error') {
            toast({ variant: "destructive", title: "Live Update Stream Error", description: `Backend stream reported: ${eventData.message || 'Unknown stream error'}`, duration: 7000 });
        }
      } catch (parseError) { /* console.error("Error parsing SSE data:", parseError, "Raw data:", event.data); */ }
    };

    newEventSource.onerror = () => {
      newEventSource.close(); 
      setConnectionStatus(prevStatus => {
        if (prevStatus !== 'error') { 
          toast({ 
            variant: "destructive", 
            title: "Live Connection Failed", 
            description: `Could not connect to live update stream. Check backend.`, 
            duration: 10000 
          });
        }
        return 'error'; 
      });
    };
    return () => { if (eventSourceRef.current) eventSourceRef.current.close(); eventSourceRef.current = null; };
  }, [checkApiUrl, updateFrontendVoltages, toast, connectionStatus, showIntroAnimation]); 

  useEffect(() => { 
    if (showIntroAnimation) return; 
    fetchFullData(); 
  }, [fetchFullData, showIntroAnimation]);

  const handleDownloadCSV = () => { if (!checkApiUrl()) return; window.open(`${FLASK_API_BASE_URL}/api/download`, '_blank'); };

  const handleGenerateDiagnosticReport = () => {
    const voltagesForReport = cellVoltages.map(c => c.voltage === null ? 0.0 : c.voltage); 
    if (voltagesForReport.some(v => typeof v !== 'number')) {
       toast({ variant: "destructive", title: "Cannot generate report", description: `Valid numeric voltage readings for all ${NUMBER_OF_CELLS} cells are required.` });
      return;
    }
    startDiagnosticGeneration(async () => {
      setDiagnosticReportData(null); 
      const result = await getAIDiagnosticReport({ cellVoltages: voltagesForReport, userContext: userAiContextDiagnostics });
      if (result.success && result.data) {
        setDiagnosticReportData(result.data);
        toast({ title: "Diagnostic Report Generated", description: "AI analysis complete." });
      } else {
        setDiagnosticReportData({ reportSummary: "Failed to generate report. " + (result.error || ""), detailedAnomalies: [] });
        toast({ variant: "destructive", title: "Report Generation Failed", description: result.error || "An unknown error occurred." });
      }
    });
  };
  
  const handleGenerateAdvice = () => {
    const voltagesForReport = cellVoltages.map(c => c.voltage === null ? 0.0 : c.voltage);
     if (voltagesForReport.some(v => typeof v !== 'number')) {
       toast({ variant: "destructive", title: "Cannot get advice", description: `Valid numeric voltage readings are required.` }); return;
    }
    startAdviceGeneration(async () => {
      setOptimalAdvice(null);
      const result = await getAIOptimalUsageAdvice({ cellVoltages: voltagesForReport, userContext: userAiContextAdvice });
      if (result.success && result.advice) {
        setOptimalAdvice(result.advice);
        toast({ title: "Usage Advice Generated" });
      } else {
        setOptimalAdvice("Failed to generate advice. " + (result.error || ""));
        toast({ variant: "destructive", title: "Advice Generation Failed", description: result.error || "An unknown error occurred." });
      }
    });
  };

  const handleGeneratePredictiveAlerts = () => {
    if (history.length < NUMBER_OF_CELLS * 2) { 
        toast({ variant: "destructive", title: "Not Enough Data", description: "More historical data is needed for predictive alerts." }); return;
    }
    
    const allCellsRecentHistory: RecentCellHistory[] = [];
    for (let i = 1; i <= NUMBER_OF_CELLS; i++) {
        const cellSpecificHistory = history.filter(h => h.cell === i).slice(-10); 
        if (cellSpecificHistory.length >=2) { 
            allCellsRecentHistory.push({
                cell: i,
                recentVoltages: cellSpecificHistory.map(h => h.voltage)
            });
        }
    }
    if (allCellsRecentHistory.length === 0) {
         toast({ variant: "destructive", title: "Not Enough Recent Data", description: "Could not prepare recent data for all cells." }); return;
    }

    startPredAlertGeneration(async () => {
        setPredictiveAlerts([]);
        const result = await getAIPredictiveAlerts({ allCellsRecentHistory });
        if (result.success && result.data?.alerts) {
            setPredictiveAlerts(result.data.alerts);
            toast({ title: "Predictive Alerts Checked", description: result.data.alerts.length > 0 ? `${result.data.alerts.length} alert(s) found.` : "No immediate predictive concerns found." });
        } else {
            toast({ variant: "destructive", title: "Predictive Alert Failed", description: result.error || "An unknown error occurred." });
        }
    });
  };


  const handleManualRefresh = () => {
    setDiagnosticReportData(null); setOptimalAdvice(null); setPredictiveAlerts([]);
    toast({ title: "Refreshing Data", description: "Fetching latest data from backend..."});
    fetchFullData(true); 
  };

  const handleCellCardClick = (cellNumber: number) => { setSelectedCellForModal(cellNumber); setIsModalOpen(true); };
  const isEffectivelyInitialLoading = isLoadingFullData && cellVoltages.every(c => c.voltage === 0.0) && history.length === 0 && !dashboardStats;

  const overallPackVoltage = cellVoltages.reduce((acc, cv) => acc + (cv.voltage || 0), 0);
  const validVoltages = cellVoltages.map(cv => cv.voltage).filter(v => v !== null) as number[];
  const minCellVoltage = validVoltages.length > 0 ? Math.min(...validVoltages) : 0;
  const maxCellVoltage = validVoltages.length > 0 ? Math.max(...validVoltages) : 0;
  const voltageSpread = validVoltages.length > 1 ? maxCellVoltage - minCellVoltage : 0;

  const selectedCellCurrentReading = cellVoltages.find(c => c.cell === selectedCellForModal);

  if (showIntroAnimation) {
    return <ElectricLoadingAnimation onComplete={() => setShowIntroAnimation(false)} duration={2500} />;
  }

  return (
    <div className="w-full flex flex-col flex-grow min-h-0">
      <Header connectionStatus={connectionStatus} pageTitle="Dashboard Overview" />
      <main className="w-full flex-grow p-4 md:p-6 lg:p-8 space-y-8 overflow-y-auto">
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{NUMBER_OF_CELLS}-Cell Battery Monitor</h2>
            <p className="text-muted-foreground">Real-time monitoring and diagnostics for your lithium battery pack.</p>
        </div>

        <VoltageDashboard 
            voltages={cellVoltages} 
            isLoading={isLoadingFullData && cellVoltages.every(c => c.voltage === 0.0)} 
            numberOfCells={NUMBER_OF_CELLS}
            onCellClick={handleCellCardClick}
            lastUpdatedTimestamp={liveVoltagesLastUpdated}
        />

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-primary" />Pack Health Dashboard</CardTitle>
                <CardDescription>Overview of battery pack health and key statistics.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingStats ? ( 
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(5)].map((_,i) => <Skeleton key={`stat-skel-${i}`} className="h-8 w-full" />)}
                    </div>
                ) : dashboardStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <p><strong className="text-foreground">Overall Pack Voltage:</strong> {overallPackVoltage.toFixed(2)}V</p>
                        <p><strong className="text-foreground">Cell Voltage Spread:</strong> {voltageSpread.toFixed(2)}V</p>
                        <p><strong className="text-foreground">Min Cell Voltage:</strong> {minCellVoltage.toFixed(2)}V</p>
                        <p><strong className="text-foreground">Max Cell Voltage:</strong> {maxCellVoltage.toFixed(2)}V</p>
                        <p><strong className="text-foreground">Total Readings Logged:</strong> {dashboardStats.total_readings ?? 'N/A'}</p>
                        <p><strong className="text-foreground">Last Logged Reading (DB):</strong> {dashboardStats.latest_reading_timestamp ? new Date(dashboardStats.latest_reading_timestamp).toLocaleString() : 'N/A'}</p>
                        <div className="lg:col-span-3">
                            <strong className="text-foreground block mb-1">Average Voltage per Cell (Logged):</strong>
                            {dashboardStats.average_voltages_per_cell && dashboardStats.average_voltages_per_cell.length > 0 ? (
                                <ul className="list-disc list-inside pl-1 columns-1 md:columns-2">
                                {dashboardStats.average_voltages_per_cell.map((cs: AverageVoltagePerCell) => (
                                    <li key={`avg-volt-${cs.cell}`}>
                                        Cell {cs.cell}: {cs.avg_voltage !== null && cs.avg_voltage !== undefined ? `${cs.avg_voltage.toFixed(2)}V` : 'N/A'}
                                    </li>
                                ))}
                                </ul>
                            ) : (<p className="text-muted-foreground">No average voltage data.</p>)}
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground flex items-center"><AlertCircle className="mr-2 h-4 w-4 text-status-warning-orange" />Could not load dashboard statistics.</p>
                )}
            </CardContent>
            {dashboardLastUpdated && <CardFooter className="text-xs text-muted-foreground justify-end pt-2">Dashboard Data Last Updated: {dashboardLastUpdated}</CardFooter>}
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Controls & AI Insights</CardTitle>
            <CardDescription>Manage data and get AI-powered insights into your battery's health and behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button onClick={handleManualRefresh} disabled={isGeneratingDiagnostics || isGeneratingAdvice || isGeneratingPredAlerts} className="min-w-[160px]">
                <RefreshCw className={`mr-2 h-4 w-4 ${(isGeneratingDiagnostics || isGeneratingAdvice || isGeneratingPredAlerts) ? 'animate-spin' : ''}`} />
                {(isGeneratingDiagnostics || isGeneratingAdvice || isGeneratingPredAlerts) ? 'Updating...' : 'Refresh All Data'}
              </Button>
              <Button onClick={handleDownloadCSV} variant="outline" className="min-w-[160px]">
                <Download className="mr-2 h-4 w-4" /> Download CSV
              </Button>
            </div>
            <Separator />
            <DiagnosticReportSection 
              reportData={diagnosticReportData} 
              isLoading={isGeneratingDiagnostics}
              userContext={userAiContextDiagnostics}
              onUserContextChange={setUserAiContextDiagnostics}
            />
            <Button
                onClick={handleGenerateDiagnosticReport}
                variant="default"
                disabled={isGeneratingDiagnostics}
                className="w-full sm:w-auto"
            >
                <Brain className={`mr-2 h-4 w-4 ${isGeneratingDiagnostics ? 'animate-pulse' : ''}`} />
                {isGeneratingDiagnostics ? 'Generating Diagnostics...' : 'Generate Diagnostic Report'}
            </Button>
            
            <Separator />
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl"><Lightbulb className="mr-2 h-6 w-6 text-yellow-400" />AI Usage & Charging Advice</CardTitle>
                <CardDescription>Get AI recommendations based on current battery state and your usage context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiContextAdvice" className="flex items-center"><Activity className="mr-2 h-4 w-4 text-muted-foreground"/>Your Intent/Context for Advice</Label>
                  <Textarea id="aiContextAdvice" placeholder="E.g., 'Storing for winter', 'Need max runtime tomorrow', 'Just finished a long trip'" value={userAiContextAdvice} onChange={(e) => setUserAiContextAdvice(e.target.value)} className="min-h-[60px]" disabled={isGeneratingAdvice} />
                </div>
                {isGeneratingAdvice ? (
                  <div className="space-y-2 pt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
                ) : optimalAdvice ? (
                  <Alert variant="default"><AlertCircle className="h-4 w-4" /><AlertTitle>Advice:</AlertTitle><AlertDescription className="whitespace-pre-wrap">{optimalAdvice}</AlertDescription></Alert>
                ) : (<p className="text-sm text-muted-foreground pt-2">Enter context and click below to get advice.</p>)}
              </CardContent>
              <CardFooter>
                 <Button onClick={handleGenerateAdvice} variant="default" disabled={isGeneratingAdvice} className="w-full sm:w-auto">
                    <Lightbulb className={`mr-2 h-4 w-4 ${isGeneratingAdvice ? 'animate-pulse' : ''}`} />
                    {isGeneratingAdvice ? 'Getting Advice...' : 'Get Usage Advice'}
                </Button>
              </CardFooter>
            </Card>

            <Separator />
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl"><Zap className="mr-2 h-6 w-6 text-orange-400" />AI Predictive Alerts</CardTitle>
                    <CardDescription>Analyze recent trends for potential upcoming issues. Requires some history.</CardDescription>
                </CardHeader>
                <CardContent>
                {isGeneratingPredAlerts ? (
                    <div className="space-y-2 pt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
                ) : predictiveAlerts.length > 0 ? (
                    <div className="space-y-3">
                    {predictiveAlerts.map((alert, idx) => (
                        <Alert key={idx} variant={alert.severity === 'critical' ? 'destructive' : 'default'} className={alert.severity === 'warning' ? 'border-yellow-500/50 bg-yellow-900/30' : ''}>
                            <Zap className="h-4 w-4" />
                            <AlertTitle className={alert.severity === 'critical' ? '' : alert.severity === 'warning' ? 'text-yellow-300' : 'text-foreground'}>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Alert {alert.cell ? `(Cell ${alert.cell})` : '(Pack)'}
                            </AlertTitle>
                            <AlertDescription className={alert.severity === 'critical' ? '' : alert.severity === 'warning' ? 'text-yellow-400/90' : 'text-muted-foreground'}>
                                {alert.message}
                            </AlertDescription>
                        </Alert>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground pt-2">No predictive alerts generated yet, or no concerning trends found from recent history.</p>
                )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGeneratePredictiveAlerts} variant="outline" disabled={isGeneratingPredAlerts} className="w-full sm:w-auto">
                        <Zap className={`mr-2 h-4 w-4 ${isGeneratingPredAlerts ? 'animate-pulse' : ''}`} />
                        {isGeneratingPredAlerts ? 'Analyzing History...' : 'Check Predictive Alerts'}
                    </Button>
                </CardFooter>
            </Card>

          </CardContent>
        </Card>

        <div className="flex-grow min-h-0">
            <HistoricalVoltageChart historyData={history} isLoading={isLoadingHistory && history.length === 0} />
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-foreground mb-4">Voltage History Table</h3>
          <HistoryTable data={history} isLoading={isLoadingHistory && history.length === 0} />
        </div>

        <CellDetailModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            cellNumber={selectedCellForModal}
            currentCellReading={selectedCellCurrentReading}
            historyData={history}
        />
      </main>
      <footer className="p-4 text-center text-xs text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Battery Monitor. All rights reserved.</p>
        <p>Inspired by modern vehicle dashboard interfaces.</p>
      </footer>
    </div>
  );
}

