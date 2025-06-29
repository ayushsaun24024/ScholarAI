'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, RefreshCw, Sparkles, Download } from 'lucide-react';
import { BuildAIQuizOutput } from '@/ai/flows/build-ai-quiz';
import { useToast } from '@/hooks/use-toast';

type QuizQuestion = BuildAIQuizOutput['quiz'][0];
type ResultItem = {
    question: QuizQuestion;
    selectedAnswer?: number;
}
export type QuizResult = {
    score: number;
    total: number;
    answeredCorrectly: ResultItem[];
    answeredIncorrectly: ResultItem[];
};

type QuizResultsProps = {
  results: QuizResult;
  onRestart: () => void;
  onNewQuiz: () => void;
};

export function QuizResults({ results, onRestart, onNewQuiz }: QuizResultsProps) {
  const { score, total, answeredCorrectly, answeredIncorrectly } = results;
  const percentage = Math.round((score / total) * 100);
  const { toast } = useToast();

  const handleDownload = () => {
    let textContent = `Quiz Results\nScore: ${score}/${total} (${percentage}%)\n\n`;

    textContent += "Correct Answers:\n";
    answeredCorrectly.forEach((item, index) => {
      textContent += `${index + 1}. ${item.question.question}\n`;
      textContent += `   Correct Answer: ${item.question.options[item.question.correctAnswerIndex]}\n`;
      textContent += `   Explanation: ${item.question.explanation}\n\n`;
    });

    textContent += "Incorrect Answers:\n";
    answeredIncorrectly.forEach((item, index) => {
        textContent += `${index + 1}. ${item.question.question}\n`;
        const selected = (item.selectedAnswer !== undefined) ? item.question.options[item.selectedAnswer] : "No answer";
        textContent += `   Your Answer: ${selected}\n`;
        textContent += `   Correct Answer: ${item.question.options[item.question.correctAnswerIndex]}\n`;
        textContent += `   Explanation: ${item.question.explanation}\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
        title: "Download Started",
        description: "Your quiz results are being downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="text-center shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Quiz Complete!</CardTitle>
          <CardDescription>Here's how you did.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative h-40 w-40">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                        className="text-accent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className="text-primary"
                        strokeDasharray={`${percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{percentage}%</span>
                    <span className="text-muted-foreground">{score} / {total} correct</span>
                </div>
            </div>
            <div className="flex space-x-2 pt-4">
                <Button onClick={onRestart}><RefreshCw className="mr-2 h-4 w-4"/>Restart Quiz</Button>
                <Button onClick={onNewQuiz} variant="secondary"><Sparkles className="mr-2 h-4 w-4"/>Generate New Quiz</Button>
                <Button onClick={handleDownload} variant="outline"><Download className="mr-2 h-4 w-4"/>Download Results</Button>
            </div>
        </CardContent>
      </Card>
      
      <Accordion type="multiple" className="w-full space-y-4">
        {answeredCorrectly.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-green-500 flex items-center gap-2"><CheckCircle2/>Correct Answers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible>
                    {answeredCorrectly.map(({ question }, index) => (
                        <AccordionItem value={`correct-${index}`} key={`correct-${index}`}>
                            <AccordionTrigger>{question.question}</AccordionTrigger>
                            <AccordionContent className="space-y-2 text-base">
                                <p><strong>Correct Answer: </strong>{question.options[question.correctAnswerIndex]}</p>
                                <p className="text-muted-foreground"><strong>Explanation: </strong>{question.explanation}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
            </Card>
        )}
        {answeredIncorrectly.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2"><XCircle/>Incorrect Answers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible>
                    {answeredIncorrectly.map(({ question, selectedAnswer }, index) => (
                        <AccordionItem value={`incorrect-${index}`} key={`incorrect-${index}`}>
                            <AccordionTrigger>{question.question}</AccordionTrigger>
                            <AccordionContent className="space-y-2 text-base">
                                <p className="text-destructive"><strong>Your Answer: </strong>{ (selectedAnswer !== undefined) ? question.options[selectedAnswer] : 'Not answered'}</p>
                                <p className="text-green-500"><strong>Correct Answer: </strong>{question.options[question.correctAnswerIndex]}</p>
                                <p className="text-muted-foreground"><strong>Explanation: </strong>{question.explanation}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
            </Card>
        )}
      </Accordion>
    </div>
  );
}
