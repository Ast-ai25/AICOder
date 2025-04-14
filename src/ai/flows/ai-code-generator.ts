'use server';
/**
 * @fileOverview A code generation AI agent.
 *
 * - generateCodeSnippet - A function that generates code snippets based on prompts.
 * - GenerateCodeSnippetInput - The input type for the generateCodeSnippet function.
 * - GenerateCodeSnippetOutput - The return type for the generateCodeSnippet function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCodeSnippetInputSchema = z.object({
  prompt: z.string().describe('A description of the code snippet to generate.'),
  projectContext: z.string().optional().describe('Context about the project, such as file structure, to inform code generation.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

const GenerateCodeSnippetOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeSnippetOutput = z.infer<typeof GenerateCodeSnippetOutputSchema>;

export async function generateCodeSnippet(input: GenerateCodeSnippetInput): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('A description of the code snippet to generate.'),
      projectContext: z.string().optional().describe('Context about the project, such as file structure, to inform code generation.'),
    }),
  },
  output: {
    schema: z.object({
      codeSnippet: z.string().describe('The generated code snippet.'),
    }),
  },
  prompt: `You are an AI code generator that generates code snippets based on a description.

  The code snippet should adhere to the project's existing structure and style, as much as possible.

  Here is the description of the code snippet to generate:
  {{prompt}}

  Here is the project context:
  {{projectContext}}
  `,
});

const generateCodeSnippetFlow = ai.defineFlow<
  typeof GenerateCodeSnippetInputSchema,
  typeof GenerateCodeSnippetOutputSchema
>({
  name: 'generateCodeSnippetFlow',
  inputSchema: GenerateCodeSnippetInputSchema,
  outputSchema: GenerateCodeSnippetOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
