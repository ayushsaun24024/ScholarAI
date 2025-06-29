'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileUploader } from '@/components/file-uploader';
import { DashboardClient } from '@/components/dashboard-client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Terminal, Loader2, FileUp, GraduationCap, BookOpen, Trash2, PlusCircle } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import { format } from 'date-fns';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


// --- TYPES ---
export type AiOutputs = {
    summary?: string;
    notes?: string;
    flashcards?: {
        question: string;
        answer: string;
        explanation: string;
        options: string[];
        correctOptionIndex: number;
    }[];
    quiz?: any;
}

export type StudyDocument = {
    id: string;
    name:string;
    timestamp: string;
    wordCount: number;
    content: string;
    aiOutputs: AiOutputs;
}


// --- HELPERS ---
const STORAGE_KEY = 'scholar-ai-documents';

const extractTextFromFile = async (file: File): Promise<string> => {
    // ... (same as before)
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                if (!event.target?.result) {
                    return reject(new Error("File reading failed."));
                }
                if (file.type === 'text/plain') {
                    resolve(event.target.result as string);
                } else if (file.type === 'application/pdf') {
                    const pdf = await pdfjs.getDocument(event.target.result as ArrayBuffer).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
                    }
                    resolve(text);
                } else {
                    reject(new Error("Unsupported file type."));
                }
            } catch (error) {
                console.error("Error processing file:", error);
                reject(new Error("Failed to parse the document. It might be corrupted or in an unsupported format."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};


// --- MAIN APP COMPONENT ---
export function ScholarApp() {
    const [documents, setDocuments] = useState<StudyDocument[]>([]);
    const [activeDocument, setActiveDocument] = useState<StudyDocument | null>(null);
    const [view, setView] = useState<'home' | 'upload' | 'loading' | 'dashboard'>('loading');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            const savedDocs = localStorage.getItem(STORAGE_KEY);
            if (savedDocs) {
                setDocuments(JSON.parse(savedDocs));
            }
        } catch (e) {
            console.error("Failed to load documents from localStorage", e);
            setDocuments([]);
        }
        setView('home');
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
            } catch (e) {
                console.error("Failed to save documents to localStorage", e);
            }
        }
    }, [documents, isInitialized]);
    
    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
        if (selectedFile) {
            setError(null);
        }
    };

    const handleProcessFile = async () => {
        if (!file) return;
        setView('loading');
        setError(null);
        try {
            const text = await extractTextFromFile(file);
            if (!text.trim()) {
                throw new Error("Could not extract any text from the document. Please ensure it's a text-based file.");
            }
            const newDoc: StudyDocument = {
                id: uuidv4(),
                name: file.name,
                timestamp: new Date().toISOString(),
                wordCount: text.split(/\s+/).length,
                content: text,
                aiOutputs: {},
            };
            setDocuments(prev => [...prev, newDoc]);
            setActiveDocument(newDoc);
            setView('dashboard');
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during processing.');
            setView(documents.length > 0 ? 'home' : 'upload');
        } finally {
            setFile(null);
        }
    };

    const updateActiveDocument = useCallback((updatedOutputs: Partial<AiOutputs>) => {
        if (!activeDocument) return;

        const updatedDoc = {
            ...activeDocument,
            aiOutputs: {
                ...activeDocument.aiOutputs,
                ...updatedOutputs,
            }
        };

        setActiveDocument(updatedDoc);
        setDocuments(docs => docs.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
    }, [activeDocument]);

    const selectDocument = (docId: string) => {
        const doc = documents.find(d => d.id === docId);
        if (doc) {
            setActiveDocument(doc);
            setView('dashboard');
        }
    };

    const deleteDocument = (docId: string) => {
        setDocuments(docs => docs.filter(d => d.id !== docId));
    };

    const resetToHome = () => {
        setActiveDocument(null);
        setView('home');
    }
    
    // RENDER LOGIC
    if (view === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Analyzing your document...</p>
            </div>
        )
    }

    if (view === 'dashboard' && activeDocument) {
        return (
            <div className="flex flex-col min-h-screen">
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <span className="font-bold font-headline text-lg">
                                Scholar's AI Companion
                            </span>
                        </div>
                        <Button onClick={resetToHome} variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" />
                            My Documents
                        </Button>
                    </div>
                </header>
                <main className="flex-1">
                    <div className="container mx-auto p-4 md:p-8">
                        <DashboardClient document={activeDocument} onUpdate={updateActiveDocument} />
                    </div>
                </main>
            </div>
        );
    }
    
    // HOME / UPLOAD VIEW
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter bg-gradient-to-r from-primary via-blue-400 to-accent text-transparent bg-clip-text">
                    Scholar's AI Companion
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                    Turn any academic document into a complete, interactive study experience.
                </p>
            </div>
            
            <div className="mt-8 w-full max-w-2xl space-y-6">
                {view === 'upload' ? (
                     <Card>
                        <CardHeader>
                            <CardTitle>Upload New Document</CardTitle>
                            <CardDescription>Select a PDF or TXT file to get started.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FileUploader onFileSelect={handleFileSelect} selectedFile={file} />
                             {error && (
                                <Alert variant="destructive">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Processing Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="flex gap-2">
                                <Button onClick={handleProcessFile} disabled={!file} size="lg" className="w-full font-bold">
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Process Document
                                </Button>
                                {documents.length > 0 && (
                                    <Button onClick={() => setView('home')} size="lg" variant="outline">Cancel</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>My Documents</CardTitle>
                                <CardDescription>Select a document to study or upload a new one.</CardDescription>
                            </div>
                            <Button onClick={() => setView('upload')}><PlusCircle className="h-4 w-4 mr-2" />Upload New</Button>
                        </CardHeader>
                        <CardContent>
                            {documents.length > 0 ? (
                                <ul className="space-y-3">
                                    {documents.map(doc => (
                                        <li key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                           <div className="flex items-center gap-3">
                                                <BookOpen className="w-5 h-5 text-primary"/>
                                                <div>
                                                    <p className="font-semibold">{doc.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Uploaded on {format(new Date(doc.timestamp), "MMM d, yyyy")} &bull; {doc.wordCount} words
                                                    </p>
                                                </div>
                                           </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => selectDocument(doc.id)}>Study</Button>
                                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteDocument(doc.id)}>
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">You haven't uploaded any documents yet.</p>
                                    <Button variant="link" className="mt-2" onClick={() => setView('upload')}>Upload your first document</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
                <p>Built with Next.js, Genkit, and ShadCN UI.</p>
            </footer>
        </div>
    );
}
