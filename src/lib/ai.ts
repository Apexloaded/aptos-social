import {
  OPENAI_API_KEY,
  OPENAI_ORG_ID,
  OPENAI_PROJECT_ID,
} from '@/config/constants';
import { createOpenAI } from '@ai-sdk/openai';
import OpenAI from 'openai';

export const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORG_ID,
  project: OPENAI_PROJECT_ID,
});

export const openAi = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORG_ID,
  project: OPENAI_PROJECT_ID,
});
