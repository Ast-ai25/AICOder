'use server';
/**
 * @fileOverview Automatically detects errors in code and provides solutions after user permission.
 *
 * - autoDetectErrorsAndProvideSolutions - A function that handles the error detection and solution providing process.
 * - AutoDetectErrorsAndProvideSolutionsInput - The input type for the autoDetectErrorsAndProvideSolutions function.
 * - AutoDetectErrorsAndProvideSolutionsOutput - The return type for the autoDetectErrorsAndProvideSolutions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { ESLint, Linter } from 'eslint';
// import * as babelParser from '@babel/eslint-parser';

const AutoDetectErrorsAndProvideSolutionsInputSchema = z.object({
  code: z.string().describe('The code to analyze for errors.'),
  filePath: z.string().describe('The path to the file containing the code.'),
  userConsent: z.boolean().describe('Whether the user has given consent to automatically detect and solve errors automatically.'),
});
export type AutoDetectErrorsAndProvideSolutionsInput = z.infer<typeof AutoDetectErrorsAndProvideSolutionsInputSchema>;

const AutoDetectErrorsAndProvideSolutionsOutputSchema = z.object({
  hasErrors: z.boolean().describe('Whether errors were detected in the code.'),
  errorMessage: z.string().optional().describe('The error message if an error was detected.'),
  suggestedSolution: z.string().optional().describe('The suggested solution to fix the error, if an error was detected.'),
});
export type AutoDetectErrorsAndProvideSolutionsOutput = z.infer<typeof AutoDetectErrorsAndProvideSolutionsOutputSchema>;

export async function autoDetectErrorsAndProvideSolutions(input: AutoDetectErrorsAndProvideSolutionsInput): Promise<AutoDetectErrorsAndProvideSolutionsOutput> {
  return autoDetectErrorsAndProvideSolutionsFlow(input);
}

const analyzeCodeForErrors = ai.defineTool({
  name: 'analyzeCodeForErrors',
  description: 'Analyzes the given code for errors using ESLint and returns an error message if found.',
  inputSchema: z.object({
    code: z.string().describe('The code to analyze.'),
    filePath: z.string().describe('The path to the file containing the code.'),
  }),
  outputSchema: z.string(),
},
async input => {
    // Initialize ESLint
    const eslint = new ESLint({ fix: false, useEslintrc: false,
      overrideConfig: {
        baseConfig: {
          parserOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            ecmaFeatures: { jsx: true },
          },
          env: {
            browser: true,
            node: true,
            es6: true,
          },
          rules: {
            'no-unused-vars': 'warn',
            'no-console': 'warn',
            'no-debugger': 'warn',
            'no-undef': 'warn',
          },
        }
      }
    });

  try {
    // Run ESLint on the code
    const results = await eslint.lintText(input.code, { filePath: input.filePath });

    // Extract error messages
    if (results && results.length > 0) {
      const errors = results[0].messages.map((message: Linter.LintMessage) => `Line ${message.line}, Col ${message.column}: ${message.message} (${message.ruleId})`).join('; ');
      if (errors) {
        return errors;
      }
    }
    return "";
  } catch (error: any) {
    console.error("Error during ESLint analysis:", error);
    return `[Error] Code analysis failed: ${error.message}`;
  }
});


const prompt = ai.definePrompt({
  name: 'autoDetectErrorsAndProvideSolutionsPrompt',
  input: {
    schema: z.object({
      code: z.string().describe('The code to analyze for errors.'),
      filePath: z.string().describe('The path to the file containing the code.'),
    }),
  },
  output: {
    schema: z.object({
      hasErrors: z.boolean().describe('Whether errors were detected in the code.'),
      errorMessage: z.string().optional().describe('The error message if an error was detected.'),
      suggestedSolution: z.string().optional().describe('The suggested solution to fix the error, if an error was detected.'),
    }),
  },
  prompt: `You are a code analysis assistant. Analyze the provided code and identify any potential errors.

  If you find errors, provide a clear error message and a suggested solution.
  If no errors are found, indicate that no errors were detected.

  Code: {{{code}}}
  File Path: {{{filePath}}}
  `,
  tools: [analyzeCodeForErrors],
});

const autoDetectErrorsAndProvideSolutionsFlow = ai.defineFlow<
  typeof AutoDetectErrorsAndProvideSolutionsInputSchema,
  typeof AutoDetectErrorsAndProvideSolutionsOutputSchema
>({
  name: 'autoDetectErrorsAndProvideSolutionsFlow',
  inputSchema: AutoDetectErrorsAndProvideSolutionsInputSchema,
  outputSchema: AutoDetectErrorsAndProvideSolutionsOutputSchema,
}, async input => {
  if (!input.userConsent) {
    return {
      hasErrors: false,
      errorMessage: 'User consent required to detect and solve errors automatically.',
      suggestedSolution: undefined,
    };
  }

  const errorResult = await analyzeCodeForErrors({code: input.code, filePath: input.filePath});
  const hasErrors = errorResult !== "";

  let solutionPrompt = "";
  if (hasErrors) {
    solutionPrompt = `Based on the following error: ${errorResult}, suggest a solution to fix the error.`;
  } else {
    return {
      hasErrors: false,
      errorMessage: 'No errors detected.',
      suggestedSolution: undefined,
    };
  }

  const {output} = await prompt({
    code: input.code,
    filePath: input.filePath,
  });

  if (output?.errorMessage) {
    return {
      hasErrors: true,
      errorMessage: output.errorMessage,
      suggestedSolution: output.suggestedSolution,
    };
  } else {
    return {
      hasErrors: false,
      errorMessage: 'No errors detected.',
      suggestedSolution: undefined,
    };
  }
});
