'use client';

import { useState, useCallback } from 'react';
import { generateStudyNotes } from '@/ai/flows/generate-study-notes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { Download, Terminal, Eye, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';

type NotesViewProps = {
  documentContent: string;
  initialNotes?: string;
  onNotesUpdate: (notes: string) => void;
};

export function NotesView({ documentContent, initialNotes, onNotesUpdate }: NotesViewProps) {
  const [notes, setNotes] = useState<string>(initialNotes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!initialNotes);
  const { toast } = useToast();

  const handleGenerateNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateStudyNotes({ documentContent });
      setNotes(result.studyNotes);
      onNotesUpdate(result.studyNotes);
      setIsEditing(false); // Switch to view mode after generating
    } catch (e) {
      setError('Failed to generate notes. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [documentContent, onNotesUpdate]);

  const handleDownload = () => {
    const blob = new Blob([notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-notes.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
        title: "Download Started",
        description: "Your notes are being downloaded as a Markdown file.",
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onNotesUpdate(newNotes);
  };
  
  const toggleEditMode = () => setIsEditing(prev => !prev);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
            <h2 className="text-2xl font-bold font-headline">Interactive Notes</h2>
            <p className="text-muted-foreground">Editable, topic-based notes from your document.</p>
        </div>
        {notes && !isLoading && (
            <div className="flex gap-2">
                 <Button onClick={toggleEditMode} variant="outline">
                    {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                    {isEditing ? 'View' : 'Edit'}
                </Button>
                <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download .md
                </Button>
            </div>
        )}
      </div>

      {!notes && !isLoading && (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <Button onClick={handleGenerateNotes}>Generate Study Notes</Button>
        </div>
      )}

      {isLoading && <Skeleton className="w-full h-96" />}
      
      {error && (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notes && !isLoading && (
        isEditing ? (
            <Textarea
            value={notes}
            onChange={handleNotesChange}
            className="w-full h-[60vh] text-base leading-relaxed font-mono"
            placeholder="Your study notes will appear here..."
            />
        ) : (
            <Card className="w-full h-[60vh] overflow-y-auto">
                <CardContent className="p-4">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm dark:prose-invert max-w-none"
                        components={{
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold font-headline mt-6 mb-3 border-b pb-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic my-4" {...props} />,
                        }}
                    >
                        {notes}
                    </ReactMarkdown>
                </CardContent>
            </Card>
        )
      )}
    </div>
  );
}
