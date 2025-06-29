'use client';

import { useState, useCallback, useEffect } from 'react';
import { buildAIQuiz, BuildAIQuizOutput } from '@/ai/flows/build-ai-quiz';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Terminal } from 'lucide-react';
import { QuizResults, QuizResult } from './quiz-results';

type QuizQuestion = BuildAIQuizOutput['quiz'][0];

type QuizViewProps = {
  documentContent: string;
  initialQuiz?: QuizQuestion[];
  onQuizUpdate: (quiz: QuizQuestion[]) => void;
};

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function QuizView({ documentContent, initialQuiz, onQuizUpdate }: QuizViewProps) {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(initialQuiz || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);

  const handleGenerateQuiz = useCallback(async (forceNew = false) => {
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setResults(null);
    try {
      const result = await buildAIQuiz({ documentText: documentContent });
      if (result.quiz && result.quiz.length > 0) {
        const shuffledQuiz = shuffleArray(result.quiz);
        setQuiz(shuffledQuiz);
        onQuizUpdate(shuffledQuiz);
      } else {
        setError('The AI could not generate a quiz from this document. It might be too short or in an unsupported format.');
      }
    } catch (e) {
      setError('Failed to generate quiz. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [documentContent, onQuizUpdate]);

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    let score = 0;
    const answeredCorrectly: QuizResult['answeredCorrectly'] = [];
    const answeredIncorrectly: QuizResult['answeredIncorrectly'] = [];

    quiz.forEach((q, index) => {
      const isCorrect = userAnswers[index] === q.correctAnswerIndex;
      if (isCorrect) {
        score++;
        answeredCorrectly.push({ question: q, selectedAnswer: userAnswers[index] });
      } else {
        answeredIncorrectly.push({ question: q, selectedAnswer: userAnswers[index] });
      }
    });

    setResults({
      score: score,
      total: quiz.length,
      answeredCorrectly,
      answeredIncorrectly,
    });
    setIsSubmitted(true);
  };

  const handleRestart = () => {
    if(quiz) setQuiz(shuffleArray(quiz));
    setUserAnswers({});
    setIsSubmitted(false);
    setResults(null);
    window.scrollTo(0, 0);
  }
  
  const handleNewQuiz = () => {
      handleGenerateQuiz(true);
  }

  if (isSubmitted && results) {
    return <QuizResults results={results} onRestart={handleRestart} onNewQuiz={handleNewQuiz} />;
  }

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <h2 className="text-2xl font-bold font-headline">AI-Generated Quiz</h2>
                <p className="text-muted-foreground">Test your knowledge with a multiple-choice quiz.</p>
            </div>
        </div>

      {!quiz && !isLoading && (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <Button onClick={() => handleGenerateQuiz()}>Generate Quiz</Button>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-40" />)}
        </div>
      )}
      
      {error && (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {quiz && !isLoading && (
        <div className="space-y-6">
          {quiz.map((q, qIndex) => (
            <Card key={qIndex} className="shadow-md">
              <CardHeader>
                <CardTitle className="leading-relaxed">
                  {qIndex + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
                  value={userAnswers[qIndex]?.toString()}
                  className="space-y-3"
                >
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-3 p-3 rounded-md border has-[:checked]:border-primary has-[:checked]:bg-accent transition-colors">
                      <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`} className="text-base cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end space-x-2">
            <Button onClick={handleSubmit} size="lg" disabled={Object.keys(userAnswers).length !== quiz.length}>
              Submit Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
