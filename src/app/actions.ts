
'use server';

import { 
  generateBatteryDiagnosticReport, 
  type GenerateBatteryDiagnosticReportInput,
  type GenerateBatteryDiagnosticReportOutput 
} from '@/ai/flows/generate-battery-diagnostic-report';
import { 
  generateOptimalAdvice, 
  type GenerateOptimalAdviceInput,
  type GenerateOptimalAdviceOutput
} from '@/ai/flows/generate-optimal-advice-flow';
import {
  generatePredictiveAlerts,
  type PredictiveAlertInput,
  type PredictiveAlertOutput
} from '@/ai/flows/generate-predictive-alert-flow';

import { NUMBER_OF_CELLS } from '@/lib/constants';

export async function getAIDiagnosticReport(input: GenerateBatteryDiagnosticReportInput): Promise<{ success: boolean; data?: GenerateBatteryDiagnosticReportOutput; error?: string }> {
  if (!input || !Array.isArray(input.cellVoltages) || input.cellVoltages.length !== NUMBER_OF_CELLS || !input.cellVoltages.every(v => typeof v === 'number')) {
    return { success: false, error: `Invalid input: requires an array of ${NUMBER_OF_CELLS} cell voltages.` };
  }
  if (input.userContext !== undefined && typeof input.userContext !== 'string') {
    return { success: false, error: "Invalid input: userContext must be a string if provided." };
  }
  
  try {
    const result = await generateBatteryDiagnosticReport(input);
    if (result && result.reportSummary) { // Check for the main summary field
      return { success: true, data: result };
    }
    return { success: false, error: "AI flow did not return a valid report structure." };
  } catch (error) {
    console.error("Error generating diagnostic report:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to generate report: ${errorMessage}` };
  }
}

export async function getAIOptimalUsageAdvice(input: GenerateOptimalAdviceInput): Promise<{ success: boolean; advice?: string; error?: string }> {
  if (!input || !Array.isArray(input.cellVoltages) || input.cellVoltages.length !== NUMBER_OF_CELLS || !input.cellVoltages.every(v => typeof v === 'number')) {
    return { success: false, error: `Invalid input: requires an array of ${NUMBER_OF_CELLS} cell voltages.` };
  }
   if (input.userContext !== undefined && typeof input.userContext !== 'string') {
    return { success: false, error: "Invalid input: userContext must be a string if provided." };
  }

  try {
    const result = await generateOptimalAdvice(input);
    if (result && result.advice) {
      return { success: true, advice: result.advice };
    }
    return { success: false, error: "AI flow did not return any advice." };
  } catch (error) {
    console.error("Error generating optimal usage advice:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to generate advice: ${errorMessage}` };
  }
}

export async function getAIPredictiveAlerts(input: PredictiveAlertInput): Promise<{ success: boolean; data?: PredictiveAlertOutput; error?: string }> {
  if (!input || !Array.isArray(input.allCellsRecentHistory) || input.allCellsRecentHistory.length === 0) {
    return { success: false, error: "Invalid input: requires recent history for cells." };
  }
  // Further validation for each item in allCellsRecentHistory can be added here if needed

  try {
    const result = await generatePredictiveAlerts(input);
    // The flow is designed to return { alerts: [] } even if no alerts, so result should always exist
    if (result && Array.isArray(result.alerts)) {
        return { success: true, data: result };
    }
    return { success: false, error: "AI flow did not return a valid predictive alert structure." };
  } catch (error) {
    console.error("Error generating predictive alerts:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to generate predictive alerts: ${errorMessage}` };
  }
}
