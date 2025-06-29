// src/ai/flows/create-revision-flashcards.ts
'use server';

/**
 * @fileOverview Generates interactive flashcards from a document.
 *
 * - createRevisionFlashcards - A function that generates flashcards from the document.
 * - CreateRevisionFlashcardsInput - The input type for the createRevisionFlashcards function.
 * - CreateRevisionFlashcardsOutput - The return type for the createRevisionFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateRevisionFlashcardsInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to generate flashcards from.'),
});

export type CreateRevisionFlashcardsInput = z.infer<typeof CreateRevisionFlashcardsInputSchema>;

const CreateRevisionFlashcardsOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The question on the front of the flashcard.'),
      answer: z.string().describe('The detailed correct answer for the back of the card.'),
      explanation: z.string().describe('A brief explanation of why the answer is correct.'),
      options: z.array(z.string()).describe('An array of 4 multiple-choice options. One is the correct answer, the others are plausible distractors.'),
      correctOptionIndex: z.number().describe('The index of the correct answer in the options array.'),
    })
  ).describe('An array of interactive flashcards generated from the document.'),
});

export type CreateRevisionFlashcardsOutput = z.infer<typeof CreateRevisionFlashcardsOutputSchema>;

export async function createRevisionFlashcards(input: CreateRevisionFlashcardsInput): Promise<CreateRevisionFlashcardsOutput> {
  return createRevisionFlashcardsFlow(input);
}

const createRevisionFlashcardsPrompt = ai.definePrompt({
  name: 'createRevisionFlashcardsPrompt',
  input: {schema: CreateRevisionFlashcardsInputSchema},
  output: {schema: CreateRevisionFlashcardsOutputSchema},
  prompt: `You are an AI assistant designed to generate interactive, multiple-choice flashcards from a document for studying.

  Generate 10-15 flashcards from the provided document content. Each flashcard must be a self-contained learning unit.

  For each flashcard, provide the following:
  1.  'question': A clear question about a key concept from the document.
  2.  'options': An array of exactly 4 strings for a multiple-choice question. One option must be the correct answer, and the other three must be plausible but incorrect distractors. The correct answer from 'options' should be a concise version of the main 'answer'.
  3.  'correctOptionIndex': The 0-based index of the correct answer within the 'options' array.
  4.  'answer': A more detailed, complete answer to the question. This is what will be shown on the back of the card for full understanding.
  5.  'explanation': A brief explanation of why the answer is correct, to reinforce learning.

  Document Content: {{{documentContent}}}
  `,
});

const createRevisionFlashcardsFlow = ai.defineFlow(
  {
    name: 'createRevisionFlashcardsFlow',
    inputSchema: CreateRevisionFlashcardsInputSchema,
    outputSchema: CreateRevisionFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await createRevisionFlashcardsPrompt(input);
    return output!;
  }
);
