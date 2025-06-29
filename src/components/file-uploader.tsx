'use client';

import { useRef, useState, DragEvent } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

type FileUploaderProps = {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
};

const ACCEPTED_FILE_TYPES = ['application/pdf', 'text/plain'];

export function FileUploader({ onFileSelect, selectedFile }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: `Please upload a PDF or TXT file. You uploaded a ${file.type} file.`,
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
        accept=".pdf,.txt"
      />

      {selectedFile ? (
        <Card className="shadow-lg bg-card/50">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <FileText className="w-12 h-12 text-primary" />
              <div className="space-y-1">
                <p className="font-semibold">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onFileSelect(null)}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            'shadow-lg border-2 border-dashed border-muted-foreground/20 transition-colors duration-300 bg-card/50',
            isDragging ? 'border-primary' : 'hover:border-primary'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="p-6 text-center cursor-pointer">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-accent/50 rounded-full">
                <UploadCloud className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold font-headline">Upload your document</h3>
                <p className="text-muted-foreground">
                  Drag & drop your PDF or TXT file here, or click to select.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
