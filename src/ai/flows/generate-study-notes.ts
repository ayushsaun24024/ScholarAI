'use server';

/**
 * @fileOverview AI agent that transforms a document into editable study notes, grouped by topic with key terms bolded.
 *
 * - generateStudyNotes - A function that handles the study notes generation process.
 * - GenerateStudyNotesInput - The input type for the generateStudyNotes function.
 * - GenerateStudyNotesOutput - The return type for the generateStudyNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyNotesInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to generate study notes from.'),
});
export type GenerateStudyNotesInput = z.infer<typeof GenerateStudyNotesInputSchema>;

const GenerateStudyNotesOutputSchema = z.object({
  studyNotes: z.string().describe('The generated study notes in Markdown format.'),
});
export type GenerateStudyNotesOutput = z.infer<typeof GenerateStudyNotesOutputSchema>;

export async function generateStudyNotes(input: GenerateStudyNotesInput): Promise<GenerateStudyNotesOutput> {
  return generateStudyNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyNotesPrompt',
  input: {schema: GenerateStudyNotesInputSchema},
  output: {schema: GenerateStudyNotesOutputSchema},
  prompt: `You are an AI assistant specializing in creating high-quality, structured study notes from academic texts.

Your task is to transform the provided document content into comprehensive study notes using Markdown. The notes should be easy to read, scan, and edit.

Instructions:
1.  Organize the notes by topic or document section. Use '##' for main topic headings (e.g., '## Key Concepts from the Introduction').
2.  Within each topic, use a combination of paragraphs for explanations and bulleted lists ('*') for key points.
3.  Use markdown blockquotes ('>') for important definitions or direct quotes. Prefix the blockquote with a 📘 emoji.
4.  Use bold ('**text**') to highlight key terminology.
5.  For critical insights or main ideas, create a callout by starting a line with a 🧠 emoji followed by the text in italics.
6.  DO NOT use triple backticks ('\`\`\`') for code blocks unless there is actual source code in the document.

Document Content: {{{documentContent}}}
  `,
});

const generateStudyNotesFlow = ai.defineFlow(
  {
    name: 'generateStudyNotesFlow',
    inputSchema: GenerateStudyNotesInputSchema,
    outputSchema: GenerateStudyNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
