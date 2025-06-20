
'use server';
/**
 * @fileOverview Provides optimal usage or charging advice for a battery pack.
 *
 * - generateOptimalAdvice - A function that generates battery advice.
 * - GenerateOptimalAdviceInput - The input type for the generateOptimalAdvice function.
 * - GenerateOptimalAdviceOutput - The return type for the generateOptimalAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { NUMBER_OF_CELLS } from '@/lib/constants';

const GenerateOptimalAdviceInputSchema = z.object({
  cellVoltages: z
    .array(z.number())
    .length(NUMBER_OF_CELLS)
    .describe(`An array of current voltage readings for each of the ${NUMBER_OF_CELLS} battery cells.`),
  userContext: z.string().optional().describe(
    "Optional user-provided context about their intended use or situation (e.g., 'long-term storage', 'need maximum runtime soon', 'battery feels hot')."
  ),
});
export type GenerateOptimalAdviceInput = z.infer<typeof GenerateOptimalAdviceInputSchema>;

const GenerateOptimalAdviceOutputSchema = z.object({
  advice: z.string().describe('Actionable advice for battery usage, charging, or maintenance based on the provided data.'),
});
export type GenerateOptimalAdviceOutput = z.infer<typeof GenerateOptimalAdviceOutputSchema>;

export async function generateOptimalAdvice(input: GenerateOptimalAdviceInput): Promise<GenerateOptimalAdviceOutput> {
  return generateOptimalAdviceFlow(input);
}

const advicePrompt = ai.definePrompt({
  name: 'generateOptimalAdvicePrompt',
  input: {schema: GenerateOptimalAdviceInputSchema},
  output: {schema: GenerateOptimalAdviceOutputSchema},
  prompt: `You are a battery expert providing advice on lithium battery care and usage.
You are given the current voltages for a ${NUMBER_OF_CELLS}-cell battery pack.
Nominal voltage range for a healthy Li-ion cell is typically 3.0V (discharged) to 4.2V (fully charged).
Ideal storage voltage is around 3.7V-3.8V per cell.

Current Cell Voltages: {{{cellVoltages}}}

{{#if userContext}}
User-provided context: {{{userContext}}}
{{/if}}

Based on these voltages and any user context, provide concise, actionable advice.
Consider the overall state of charge, cell balance (voltage differences between cells), and any specific user intentions.
If cells are imbalanced (e.g., one cell is much lower or higher than others), mention it and advise monitoring or professional check-up if severe.
If user context implies a specific need (e.g., storage, max runtime), tailor advice accordingly.
Be helpful and practical. Output should be a single paragraph of advice.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const generateOptimalAdviceFlow = ai.defineFlow(
  {
    name: 'generateOptimalAdviceFlow',
    inputSchema: GenerateOptimalAdviceInputSchema,
    outputSchema: GenerateOptimalAdviceOutputSchema,
  },
  async (input) => {
    const {output} = await advicePrompt(input);
    return output!;
  }
);
