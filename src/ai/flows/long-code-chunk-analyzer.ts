// 'use server';
/**
 * @fileOverview Analyzes long code chunks and identifies potential error locations.
 *
 * - analyzeLongCodeChunk - A function that handles the analysis of long code chunks for potential errors.
 * - AnalyzeLongCodeChunkInput - The input type for the analyzeLongCodeChunk function.
 * - AnalyzeLongCodeChunkOutput - The return type for the analyzeLongCodeChunk function.
 */

'use server';
import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeLongCodeChunkInputSchema = z.object({
  code: z.string().describe('The code chunk to analyze.'),
  projectContext: z.string().optional().describe('The project context to provide additional information for analysis.'),
});

export type AnalyzeLongCodeChunkInput = z.infer<typeof AnalyzeLongCodeChunkInputSchema>;

const AnalyzeLongCodeChunkOutputSchema = z.object({
  errorLocations: z.array(
    z.object({
      location: z.string().describe('The location of the potential error.'),
      description: z.string().describe('The description of the potential error.'),
    })
  ).describe('The list of potential error locations and their descriptions.'),
});

export type AnalyzeLongCodeChunkOutput = z.infer<typeof AnalyzeLongCodeChunkOutputSchema>;

export async function analyzeLongCodeChunk(input: AnalyzeLongCodeChunkInput): Promise<AnalyzeLongCodeChunkOutput> {
  return analyzeLongCodeChunkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLongCodeChunkPrompt',
  input: {
    schema: z.object({
      code: z.string().describe('The code chunk to analyze.'),
      projectContext: z.string().optional().describe('The project context to provide additional information for analysis.'),
    }),
  },
  output: {
    schema: z.object({
      errorLocations: z.array(
        z.object({
          location: z.string().describe('The location of the potential error.'),
          description: z.string().describe('The description of the potential error.'),
        })
      ).describe('The list of potential error locations and their descriptions.'),
    }),
  },
  prompt: `You are an AI code analyzer that identifies potential error locations in a given code chunk.

  Analyze the following code chunk and identify potential error locations. Provide a description for each potential error.

  Code:
  ```
  {{{code}}}
  ```

  Project Context (if available):
  {{{projectContext}}}
  `,
});

const analyzeLongCodeChunkFlow = ai.defineFlow<
  typeof AnalyzeLongCodeChunkInputSchema,
  typeof AnalyzeLongCodeChunkOutputSchema
>({
  name: 'analyzeLongCodeChunkFlow',
  inputSchema: AnalyzeLongCodeChunkInputSchema,
  outputSchema: AnalyzeLongCodeChunkOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
