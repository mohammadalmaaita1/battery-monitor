
'use server';
/**
 * @fileOverview Analyzes recent battery history to generate predictive alerts.
 *
 * - generatePredictiveAlerts - A function that generates predictive alerts.
 * - PredictiveAlertInput - The input type for the generatePredictiveAlerts function, expecting recent history for all cells.
 * - PredictiveAlertOutput - The return type, an array of alert messages.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { PredictiveAlertInput as GenkitPredictiveAlertInput, PredictiveAlertOutput as GenkitPredictiveAlertOutput, RecentCellHistory } from '@/lib/constants';

// Re-define schema here to be used by Genkit, ensuring it matches the types in constants.ts
const RecentCellHistorySchema = z.object({
  cell: z.number().int().min(1).describe("The cell number (1-indexed)."),
  recentVoltages: z.array(z.number().nullable()).min(2).describe("Array of recent voltage readings, oldest to newest. Should include at least 2 readings for trend analysis."),
});

const PredictiveAlertInputSchema = z.object({
  allCellsRecentHistory: z.array(RecentCellHistorySchema).describe("An array containing recent voltage history for each cell."),
});
export type PredictiveAlertInput = z.infer<typeof PredictiveAlertInputSchema>;


const PredictiveAlertSchema = z.object({
  cell: z.number().int().min(1).optional().describe("The cell number (1-indexed) this alert pertains to, if specific."),
  message: z.string().describe("The predictive alert message."),
  severity: z.enum(['info', 'warning', 'critical']).describe("Severity of the alert."),
});

const PredictiveAlertOutputSchema = z.object({
  alerts: z.array(PredictiveAlertSchema).describe("An array of predictive alerts generated from the historical data."),
});
export type PredictiveAlertOutput = z.infer<typeof PredictiveAlertOutputSchema>;


export async function generatePredictiveAlerts(input: PredictiveAlertInput): Promise<PredictiveAlertOutput> {
  // Ensure the input matches the Genkit schema type if it comes from constants.ts types
  const validatedInput: GenkitPredictiveAlertInput = {
    allCellsRecentHistory: input.allCellsRecentHistory.map(cellHist => ({
        cell: cellHist.cell,
        recentVoltages: cellHist.recentVoltages.map(v => v === null ? 0.0 : v) // Convert nulls to 0.0 for LLM; ideally handle nulls better in prompt
    }))
  };
  return generatePredictiveAlertsFlow(validatedInput as any); // Cast as Genkit expects its inferred type
}

const predictiveAlertPrompt = ai.definePrompt({
  name: 'predictiveAlertPrompt',
  input: {schema: PredictiveAlertInputSchema},
  output: {schema: PredictiveAlertOutputSchema},
  prompt: `You are a battery health prediction system.
You are given recent voltage history for multiple battery cells. Cell numbers are 1-indexed.
Normal voltage for a Li-ion cell is between 3.0V and 4.2V.
Analyze the trends for each cell and the pack as a whole.

Data provided (recentVoltages are typically oldest to newest):
{{{json allCellsRecentHistory}}}

Identify potential upcoming issues based on trends:
1.  Rapidly dropping voltage in a cell compared to others.
2.  A cell consistently lagging significantly behind others in voltage.
3.  A cell's voltage becoming erratic or unstable.
4.  Overall pack voltage dropping very quickly.
5.  A cell that appears stuck or non-responsive (voltage doesn't change much while others do).

For each significant trend you identify, generate an alert with a message and severity ('info', 'warning', 'critical').
If no significant concerning trends are found, return an empty array for alerts.
Be concise. Focus on actionable or noteworthy predictions.
If a cell has null/0.0 readings among valid readings, it might indicate intermittent connection issues - flag this as a warning.

Example for a cell with rapidly dropping voltage:
{ cell: 3, message: "Cell 3 is discharging noticeably faster than other cells. Monitor for potential imbalance or internal issues.", severity: "warning" }

Example for no issues:
{ alerts: [] }
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const generatePredictiveAlertsFlow = ai.defineFlow(
  {
    name: 'generatePredictiveAlertsFlow',
    inputSchema: PredictiveAlertInputSchema,
    outputSchema: PredictiveAlertOutputSchema,
  },
  async (input) => {
    const {output} = await predictiveAlertPrompt(input);
    return output || { alerts: [] }; // Ensure alerts array is always returned
  }
);
