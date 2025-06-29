'use client';

import { useState, useCallback, useEffect } from 'react';
import { createRevisionFlashcards } from '@/ai/flows/create-revision-flashcards';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Terminal, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"


type FlashcardData = {
    question: string;
    answer: string;
    explanation: string;
    options: string[];
    correctOptionIndex: number;
};

type FlashcardsViewProps = {
  documentContent: string;
  initialFlashcards?: FlashcardData[];
  onFlashcardsUpdate: (flashcards: FlashcardData[]) => void;
};


function Flashcard({ card }: { card: FlashcardData }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
        setSelectedOption(null);
        setIsSubmitted(false);
    }, [card]);

    const handleCheckAnswer = () => {
        if (selectedOption === null) return;
        setIsSubmitted(true);
        setTimeout(() => setIsFlipped(true), 500);
    };

    const handleFlip = () => {
        setIsFlipped(true);
    }
    
    const handleReset = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setSelectedOption(null);
            setIsSubmitted(false);
        }, 350); // allow card to flip back before state resets
    }
    
    const isCorrect = selectedOption === card.correctOptionIndex;

    const getOptionStyle = (index: number) => {
        if (!isSubmitted) return "hover:bg-accent/50";
        if (index === card.correctOptionIndex) return "border-green-500 bg-green-500/10 text-primary";
        if (index === selectedOption && !isCorrect) return "border-destructive bg-destructive/10 text-destructive";
        return "border-muted-foreground/20";
    }

    return (
        <div className="w-full h-[28rem] md:h-[30rem] [perspective:1000px]">
            <div
                className={cn(
                    "relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700",
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                )}
            >
                {/* Front of card */}
                <div className="absolute w-full h-full [backface-visibility:hidden] flex flex-col p-6 rounded-lg border bg-card text-card-foreground shadow-lg">
                    <p className="text-muted-foreground text-sm mb-2">Question</p>
                    <p className="text-xl md:text-2xl font-semibold mb-4 flex-grow">{card.question}</p>
                    <RadioGroup 
                        onValueChange={(val) => setSelectedOption(parseInt(val))} 
                        value={selectedOption?.toString()}
                        disabled={isSubmitted}
                        className="space-y-2 mb-4"
                    >
                        {card.options.map((option, index) => (
                            <div key={index} className={cn("flex items-center space-x-3 p-3 rounded-md border transition-colors", getOptionStyle(index))}>
                                <RadioGroupItem value={index.toString()} id={`q-${card.question}-opt-${index}`} />
                                <Label htmlFor={`q-${card.question}-opt-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t">
                       <Button variant="ghost" onClick={handleFlip} disabled={isSubmitted}>Skip & Show Answer</Button>
                       <Button onClick={handleCheckAnswer} disabled={selectedOption === null || isSubmitted}>Check Answer</Button>
                    </div>
                </div>
                {/* Back of card */}
                <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col p-6 rounded-lg border bg-accent text-accent-foreground shadow-lg">
                    {isSubmitted && (
                        <div className="mb-4">
                            {isCorrect ? (
                                <div className="flex items-center gap-2 text-green-500 font-bold text-lg"><CheckCircle2 /> Correct!</div>
                            ) : (
                                <div className="flex items-center gap-2 text-destructive font-bold text-lg"><XCircle /> Not quite...</div>
                            )}
                        </div>
                    )}
                    <p className="text-accent-foreground/70 text-sm mb-1">Answer</p>
                    <p className="text-xl md:text-2xl font-semibold mb-4">{card.answer}</p>
                    <p className="text-accent-foreground/70 text-sm mb-1">Explanation</p>
                    <p className="text-base flex-grow overflow-y-auto">{card.explanation}</p>
                    <div className="mt-auto pt-4 border-t w-full flex justify-end">
                        <Button variant="outline" className="bg-background/50" onClick={handleReset}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try again
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FlashcardsView({ documentContent, initialFlashcards, onFlashcardsUpdate }: FlashcardsViewProps) {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>(initialFlashcards || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])


  const handleGenerateFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createRevisionFlashcards({ documentContent });
      setFlashcards(result.flashcards);
      onFlashcardsUpdate(result.flashcards);
    } catch (e) {
      setError('Failed to generate flashcards. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [documentContent, onFlashcardsUpdate]);

  const handleDownload = () => {
    const json = JSON.stringify(flashcards, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
        title: "Download Started",
        description: "Your flashcards are being downloaded as JSON.",
    });
  };

  const progressValue = count > 0 ? (current / count) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
            <h2 className="text-2xl font-bold font-headline">Revision Flashcards</h2>
            <p className="text-muted-foreground">Test yourself or flip the card to see the answer.</p>
        </div>
        {flashcards.length > 0 && !isLoading && (
            <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download .json
            </Button>
        )}
      </div>

       {!flashcards.length && !isLoading && (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <Button onClick={handleGenerateFlashcards}>Generate Flashcards</Button>
        </div>
      )}

      {isLoading && <Skeleton className="w-full h-[30rem]" />}

      {error && (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {flashcards.length > 0 && !isLoading && (
        <div className="space-y-4">
            <Carousel setApi={setApi} className="w-full max-w-xl mx-auto">
                <CarouselContent>
                    {flashcards.map((card, index) => (
                        <CarouselItem key={index}>
                            <Flashcard card={card} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex"/>
            </Carousel>
            <div className="w-full max-w-xl mx-auto space-y-2">
                <Progress value={progressValue} />
                <p className="text-center text-sm text-muted-foreground">
                    Card {current} of {count}
                </p>
            </div>
        </div>
      )}
    </div>
  );
}
