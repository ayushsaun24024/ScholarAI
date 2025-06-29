'use client';

import { useState, useCallback } from 'react';
import { summarizeDocument, SummarizeDocumentOutput } from '@/ai/flows/summarize-document';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type SummaryViewProps = {
  documentContent: string;
  initialSummary?: string;
  onSummaryUpdate: (summary: string) => void;
};

const parseSummary = (text: string) => {
    const sections = text.split('## ').filter(s => s.trim() !== '');
    const result: { title: string; content: string }[] = [];
    for (const section of sections) {
        const parts = section.split('\n');
        const title = parts[0].trim();
        const content = parts.slice(1).join('\n').trim();
        if (title && content) {
            result.push({ title, content });
        }
    }
    return result;
}

export function SummaryView({ documentContent, initialSummary, onSummaryUpdate }: SummaryViewProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await summarizeDocument({ documentText: documentContent });
      setSummary(result.summary);
      onSummaryUpdate(result.summary);
    } catch (e) {
      setError('Failed to generate summary. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [documentContent, onSummaryUpdate]);

  const parsedSummary = summary ? parseSummary(summary) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold font-headline">Document Summary</h2>
          <p className="text-muted-foreground">A high-level overview of the key topics.</p>
        </div>
        {!summary && !isLoading && (
            <Button onClick={handleGenerateSummary}>Generate Summary</Button>
        )}
      </div>
      
      {isLoading && (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summary && parsedSummary.length > 0 && (
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {parsedSummary.map((section, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="font-semibold hover:no-underline text-lg text-left">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                 <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    components={{
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                    }}
                 >
                    {section.content}
                 </ReactMarkdown>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
