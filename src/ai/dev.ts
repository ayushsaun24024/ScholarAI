import { config } from 'dotenv';
config();

import '@/ai/flows/generate-study-notes.ts';
import '@/ai/flows/build-ai-quiz.ts';
import '@/ai/flows/create-revision-flashcards.ts';
import '@/ai/flows/summarize-document.ts';