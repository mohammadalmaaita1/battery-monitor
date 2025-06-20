
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, MessageSquareText, AlertCircle, Info, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { GenerateBatteryDiagnosticReportOutput } from '@/ai/flows/generate-battery-diagnostic-report';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DiagnosticReportSectionProps {
  reportData: GenerateBatteryDiagnosticReportOutput | null;
  isLoading: boolean;
  userContext: string;
  onUserContextChange: (context: string) => void;
}

export default function DiagnosticReportSection({ reportData, isLoading, userContext, onUserContextChange }: DiagnosticReportSectionProps) {
  const reportSummary = reportData?.reportSummary;
  const detailedAnomalies = reportData?.detailedAnomalies;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Terminal className="mr-2 h-6 w-6 text-primary" />
          AI Diagnostic Report
        </CardTitle>
        <CardDescription>
          AI-powered analysis of battery cell health. Provide optional context below and click "Generate Report".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aiContext" className="flex items-center">
            <MessageSquareText className="mr-2 h-4 w-4 text-muted-foreground" />
            Optional Context for AI Diagnostics
          </Label>
          <Textarea
            id="aiContext"
            placeholder="E.g., Battery was fully charged yesterday, device has been idle, specific cell seems problematic..."
            value={userContext}
            onChange={(e) => onUserContextChange(e.target.value)}
            className="min-h-[80px]"
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2 mt-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : reportData ? (
          <>
            <Alert variant="default" className="bg-secondary/50 dark:bg-secondary/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold text-foreground">Report Summary:</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap text-foreground/90">{reportSummary || "No summary provided."}</AlertDescription>
            </Alert>

            {detailedAnomalies && detailedAnomalies.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-foreground mb-2 flex items-center">
                    <ChevronsUpDown className="mr-2 h-5 w-5 text-primary" />
                    Detailed Anomalies & Explanations:
                </h4>
                <Accordion type="single" collapsible className="w-full">
                  {detailedAnomalies.map((anomaly, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-sm hover:no-underline">
                        {anomaly.cell ? `Cell ${anomaly.cell}: ` : "Pack-wide: "} {anomaly.issue}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 text-xs pl-2">
                        <p><strong className="text-muted-foreground">Potential Causes:</strong> {anomaly.potentialCauses}</p>
                        {anomaly.recommendedAction && <p><strong className="text-muted-foreground">Recommendation:</strong> {anomaly.recommendedAction}</p>}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            {(!detailedAnomalies || detailedAnomalies.length === 0) && reportSummary && (
                <Alert variant="default" className="mt-4 bg-green-900/30 border-green-700">
                    <Info className="h-4 w-4 text-green-400" />
                    <AlertTitle className="font-semibold text-green-300">No Specific Anomalies Detected</AlertTitle>
                    <AlertDescription className="text-green-400/90">
                        The AI did not flag any specific anomalies based on the current data beyond the general summary.
                    </AlertDescription>
                </Alert>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground pt-2">No report generated yet. Click the "Generate Report" button after fetching current voltages.</p>
        )}
      </CardContent>
    </Card>
  );
}
