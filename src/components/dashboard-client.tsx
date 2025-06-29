'use client';

import type { StudyDocument, AiOutputs } from './landing-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryView } from '@/components/summary-view';
import { NotesView } from '@/components/notes-view';
import { FlashcardsView } from '@/components/flashcards-view';
import { QuizView } from '@/components/quiz-view';
import { FileText, NotebookText, Layers, Lightbulb, BrainCircuit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type DashboardClientProps = {
  document: StudyDocument;
  onUpdate: (updatedOutputs: Partial<AiOutputs>) => void;
}

export function DashboardClient({ document, onUpdate }: DashboardClientProps) {

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            Study Dashboard
          </CardTitle>
          <CardDescription>
            You are studying: <span className="font-semibold text-primary">{document.name}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="summary" className="py-2">
            <FileText className="w-4 h-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="notes" className="py-2">
            <NotebookText className="w-4 h-4 mr-2" />
            Interactive Notes
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="py-2">
            <Layers className="w-4 h-4 mr-2" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="quiz" className="py-2">
            <Lightbulb className="w-4 h-4 mr-2" />
            AI Quiz
          </TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="p-2 md:p-6">
            <TabsContent value="summary">
              <SummaryView 
                documentContent={document.content} 
                initialSummary={document.aiOutputs.summary}
                onSummaryUpdate={(summary) => onUpdate({ summary })}
              />
            </TabsContent>
            <TabsContent value="notes">
              <NotesView 
                documentContent={document.content}
                initialNotes={document.aiOutputs.notes}
                onNotesUpdate={(notes) => onUpdate({ notes })}
              />
            </TabsContent>
            <TabsContent value="flashcards">
              <FlashcardsView
                documentContent={document.content}
                initialFlashcards={document.aiOutputs.flashcards}
                onFlashcardsUpdate={(flashcards) => onUpdate({ flashcards })}
              />
            </TabsContent>
            <TabsContent value="quiz">
              <QuizView 
                documentContent={document.content}
                initialQuiz={document.aiOutputs.quiz}
                onQuizUpdate={(quiz) => onUpdate({ quiz })}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
