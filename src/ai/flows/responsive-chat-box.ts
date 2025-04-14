'use server';
/**
 * @fileOverview A Genkit flow for interacting with an AI assistant through a responsive chat box.
 *
 * - interactWithAiAssistant - A function that handles the interaction with the AI assistant.
 * - InteractWithAiAssistantInput - The input type for the interactWithAiAssistant function.
 * - InteractWithAiAssistantOutput - The return type for the interactWithAiAssistant function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const InteractWithAiAssistantInputSchema = z.object({
  message: z.string().describe('The message from the user to the AI assistant.'),
  projectFiles: z.array(
    z.object({
      name: z.string().describe('The name of the file.'),
      path: z.string().describe('The path to the file.'),
      content: z.string().describe('The content of the file.'),
    })
  ).optional().describe('The project files to provide context to the AI assistant.'),
});
export type InteractWithAiAssistantInput = z.infer<typeof InteractWithAiAssistantInputSchema>;

const InteractWithAiAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant.'),
});
export type InteractWithAiAssistantOutput = z.infer<typeof InteractWithAiAssistantOutputSchema>;

export async function interactWithAiAssistant(input: InteractWithAiAssistantInput): Promise<InteractWithAiAssistantOutput> {
  return interactWithAiAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactWithAiAssistantPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The message from the user to the AI assistant.'),
      projectFiles: z.array(
        z.object({
          name: z.string().describe('The name of the file.'),
          path: z.string().describe('The path to the file.'),
          content: z.string().describe('The content of the file.'),
        })
      ).optional().describe('The project files to provide context to the AI assistant.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The response from the AI assistant.'),
    }),
  },
  prompt: `You are a helpful AI assistant that helps developers with code-related tasks within VS Code.\n\nYou have access to the following project files:\n{{#each projectFiles}}\nFile name: {{{this.name}}}\nFile path: {{{this.path}}}\nFile content:\n{{this.content}}\n{{/each}}\n\nUser message: {{{message}}}\n\nResponse: `,
});

const interactWithAiAssistantFlow = ai.defineFlow<
  typeof InteractWithAiAssistantInputSchema,
  typeof InteractWithAiAssistantOutputSchema
>({
  name: 'interactWithAiAssistantFlow',
  inputSchema: InteractWithAiAssistantInputSchema,
  outputSchema: InteractWithAiAssistantOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
