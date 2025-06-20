
'use server';

/**
 * @fileOverview Generates a diagnostic report summarizing the health of battery cells.
 *
 * - generateBatteryDiagnosticReport - A function that generates the diagnostic report.
 * - GenerateBatteryDiagnosticReportInput - The input type for the generateBatteryDiagnosticReport function.
 * - GenerateBatteryDiagnosticReportOutput - The return type for the generateBatteryDiagnosticReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { NUMBER_OF_CELLS } from '@/lib/constants';

const GenerateBatteryDiagnosticReportInputSchema = z.object({
  cellVoltages: z
    .array(z.number())
    .length(NUMBER_OF_CELLS) 
    .describe(`An array of voltage readings for each of the ${NUMBER_OF_CELLS} battery cells.`),
  userContext: z.string().optional().describe("Optional user-provided context about the battery or situation."),
});
export type GenerateBatteryDiagnosticReportInput = z.infer<
  typeof GenerateBatteryDiagnosticReportInputSchema
>;

const AnomalyDetailSchema = z.object({
    cell: z.number().int().min(1).optional().describe("Specific cell number (1-indexed) if anomaly relates to one cell."),
    issue: z.string().describe("A concise description of the identified issue (e.g., 'Low Voltage', 'High Voltage', 'Cell Imbalance')."),
    potentialCauses: z.string().describe("A brief explanation of potential causes for this specific issue."),
    recommendedAction: z.string().optional().describe("A brief recommended action, if applicable."),
});

const GenerateBatteryDiagnosticReportOutputSchema = z.object({
  reportSummary: z.string().describe('A general diagnostic summary of the battery health.'),
  detailedAnomalies: z.array(AnomalyDetailSchema).optional().describe("An array of objects, each detailing a specific anomaly, its potential causes, and recommended actions. Empty if no significant anomalies.")
});
export type GenerateBatteryDiagnosticReportOutput = z.infer<
  typeof GenerateBatteryDiagnosticReportOutputSchema
>;

export async function generateBatteryDiagnosticReport(
  input: GenerateBatteryDiagnosticReportInput
): Promise<GenerateBatteryDiagnosticReportOutput> {
  return generateBatteryDiagnosticReportFlow(input);
}

const generateBatteryDiagnosticReportPrompt = ai.definePrompt({
  name: 'generateBatteryDiagnosticReportPrompt',
  input: {schema: GenerateBatteryDiagnosticReportInputSchema},
  output: {schema: GenerateBatteryDiagnosticReportOutputSchema},
  prompt: `You are an expert battery diagnostic system for a ${NUMBER_OF_CELLS}-cell lithium battery pack.
Normal voltage per cell: 3.0V (empty) to 4.2V (full).
Ideal operating range: 3.2V to 4.2V.
Critical low: below 3.2V. Critical high: above 4.25V.
Warning low: 3.2V to 3.7V. Warning high: 4.2V to 4.25V.

Voltage Readings: {{{json cellVoltages}}}

{{#if userContext}}
User Context: {{{userContext}}}
{{/if}}

Task:
1.  Provide a concise 'reportSummary' of overall battery health.
2.  Identify specific 'detailedAnomalies'. For each anomaly:
    *   State the 'issue' (e.g., "Cell 2 Low Voltage", "Significant Cell Imbalance").
    *   List 2-3 brief 'potentialCauses' (e.g., "Higher internal resistance", "Faulty connection", "Uneven load").
    *   Suggest a 'recommendedAction' (e.g., "Monitor closely", "Consider professional check", "Ensure proper connections").
    *   If the anomaly is pack-wide (like all cells low), the 'cell' field can be omitted. Cell numbers are 1-indexed.
    *   If no significant anomalies, 'detailedAnomalies' should be an empty array or omitted.

Focus on clear, actionable information.
Prioritize the most significant anomalies if many exist.
Consider voltage differences between cells (imbalance > 0.1V is noteworthy, >0.3V is concerning).
Incorporate user context if relevant to the diagnosis.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const generateBatteryDiagnosticReportFlow = ai.defineFlow(
  {
    name: 'generateBatteryDiagnosticReportFlow',
    inputSchema: GenerateBatteryDiagnosticReportInputSchema,
    outputSchema: GenerateBatteryDiagnosticReportOutputSchema,
  },
  async input => {
    const {output} = await generateBatteryDiagnosticReportPrompt(input);
    // Ensure detailedAnomalies is an array, even if empty, if the LLM omits it when there are no anomalies
    if (output && !output.detailedAnomalies) {
      output.detailedAnomalies = [];
    }
    return output!;
  }
);
