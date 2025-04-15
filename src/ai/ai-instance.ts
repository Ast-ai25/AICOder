
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// Import other providers if you plan to use them directly
// import {groq} from '@genkit-ai/groq';
// import {deepseek} from '@genkit-ai/deepseek';
// import {openai} from '@genkit-ai/openai';

const modelConfig = {
  googleai: {
    plugins: [
      googleAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
      }),
    ],
    model: 'googleai/gemini-2.0-flash',
  },
  // Add configurations for other models here, for example:
  // groq: {
  //   plugins: [
  //     groq({
  //       apiKey: process.env.GROQ_API_KEY,
  //     }),
  //   ],
  //   model: 'mixtral-8x7b-32768',
  // },
  // deepseek: {
  //    plugins: [
  //      deepseek({
  //        apiKey: process.env.DEEPSEEK_API_KEY,
  //      }),
  //    ],
  //    model: 'your-deepseek-model',
  // },
  // openai: {
  //   plugins: [
  //     openai({
  //       apiKey: process.env.OPENAI_API_KEY,
  //     }),
  //   ],
  //   model: 'gpt-3.5-turbo',
  // }
};

// Dynamically set the configuration based on an environment variable
const selectedModel = process.env.AI_MODEL || 'googleai'; // Default to Google AI
const config = modelConfig[selectedModel as keyof typeof modelConfig] || modelConfig['googleai'];

export const ai = genkit({
  promptDir: './prompts',
  plugins: config.plugins,
  model: config.model,
});
