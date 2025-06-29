// src/ai/flows/summarize-document.ts
'use server';

/**
 * @fileOverview A document summarization AI agent.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to summarize.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document in Markdown format.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are an expert academic summarizer. Your task is to create a detailed and well-structured summary of the provided document.

Instructions:
1.  Identify the main sections of the document (e.g., Abstract, Introduction, Methodology, Results, Discussion, Conclusion).
2.  For each section, provide a concise summary that includes a mix of paragraphs for explanation and bullet points for key details.
3.  Use Markdown for formatting. Use '## ' for main section titles. Use bold ('**text**') for important terms.
4.  Use relevant emojis to introduce sections, for example: 📜 **Abstract**, 🎯 **Introduction**, 🔬 **Methodology**, 📈 **Results**, 💬 **Discussion**, and 🏁 **Conclusion**.
5.  If a section is not present in the document, do not include it in the summary.

Document Text:
{{{documentText}}}

Summary:
`,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
