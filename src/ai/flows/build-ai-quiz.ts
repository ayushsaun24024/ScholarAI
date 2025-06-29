'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating multiple-choice quizzes from a document.
 *
 * - buildAIQuiz - A function that generates a quiz from the given text.
 * - BuildAIQuizInput - The input type for the buildAIQuiz function.
 * - BuildAIQuizOutput - The return type for the buildAIQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BuildAIQuizInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to generate the quiz from.'),
});
export type BuildAIQuizInput = z.infer<typeof BuildAIQuizInputSchema>;

const BuildAIQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The multiple-choice options.'),
      correctAnswerIndex: z
        .number()
        .describe('The index of the correct answer in the options array.'),
      explanation: z.string().describe('Explanation of the correct answer.'),
    })
  ).describe('A list of quiz questions, options, and correct answers.'),
});
export type BuildAIQuizOutput = z.infer<typeof BuildAIQuizOutputSchema>;

export async function buildAIQuiz(input: BuildAIQuizInput): Promise<BuildAIQuizOutput> {
  return buildAIQuizFlow(input);
}

const buildAIQuizPrompt = ai.definePrompt({
  name: 'buildAIQuizPrompt',
  input: {schema: BuildAIQuizInputSchema},
  output: {schema: BuildAIQuizOutputSchema},
  prompt: `You are an expert educator creating a multiple-choice quiz from a document.

  Generate a 10-question quiz based on the following document. Each question should have 4 options, with one correct answer and three plausible distractors. Include an explanation for the correct answer.

  Document:
  {{documentText}}

  Output the quiz in the following JSON format:
  {
    "quiz": [
      {
        "question": "Question 1",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswerIndex": 0,
        "explanation": "Explanation of the correct answer."
      },
      {
        "question": "Question 2",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswerIndex": 2,
        "explanation": "Explanation of the correct answer."
      }
    ]
  }
  `,
});

const buildAIQuizFlow = ai.defineFlow(
  {
    name: 'buildAIQuizFlow',
    inputSchema: BuildAIQuizInputSchema,
    outputSchema: BuildAIQuizOutputSchema,
  },
  async input => {
    const {output} = await buildAIQuizPrompt(input);
    return output!;
  }
);
