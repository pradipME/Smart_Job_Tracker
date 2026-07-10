import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resumeApi } from '../api/resume';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Upload, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';

export default function Resume() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ fileName: string; message: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const mutation = useMutation({
    mutationFn: (file: File) => resumeApi.upload(file),
    onSuccess: (res) => {
      setUploadResult(res.data);
      toast('Resume uploaded successfully!', 'success');
    },
    onError: () => {
      toast('Failed to upload resume. Please try again.', 'error');
    },
  });

  const ALLOWED_TYPES = ['application/pdf'];
  const MAX_SIZE = 5 * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PDF files are allowed.';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be under 5MB.';
    }
    return null;
  };

  const processFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast(error, 'error');
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleUpload = () => {
    if (!selectedFile) {
      toast('Please select a file first.', 'warning');
      return;
    }
    const error = validateFile(selectedFile);
    if (error) {
      toast(error, 'error');
      return;
    }
    mutation.mutate(selectedFile);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h2 className="heading-2">Resume</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Upload your resume to keep it handy with your job applications
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center transition-all duration-200 cursor-pointer group ${
            isDragOver
              ? 'border-blue-500 bg-blue-500/5 scale-[1.02]'
              : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-[var(--border)] hover:border-blue-500/50 hover:bg-[var(--accent)]/50'
          }`}
        >
          {isDragOver && (
            <div className="absolute inset-0 rounded-xl bg-blue-500/5 animate-fade-in" />
          )}

          {selectedFile && !isDragOver ? (
            <div className="relative space-y-4 animate-scale-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 mx-auto">
                <FileText className="h-9 w-9 text-white" />
              </div>
              <div>
                <p className="font-semibold text-base">{selectedFile.name}</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl mx-auto transition-all duration-200 ${
                isDragOver ? 'bg-blue-500/20 scale-110' : 'bg-[var(--muted)] group-hover:bg-blue-500/10'
              }`}>
                <Upload className={`h-9 w-9 transition-colors ${
                  isDragOver ? 'text-blue-500' : 'text-[var(--muted-foreground)]'
                }`} />
              </div>
              <div>
                <p className="font-semibold text-base">
                  {isDragOver ? 'Drop your file here' : 'Drop your resume here'}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1.5">
                  or click to browse &middot; PDF up to 5MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedFile && !isDragOver && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Success state */}
        {uploadResult && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 animate-fade-in-up">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-sm">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Upload successful</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 truncate mt-0.5">
                {uploadResult.fileName}
              </p>
            </div>
            <button
              onClick={clearFile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Action */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            loading={mutation.isPending}
          >
            <Upload className="h-4 w-4" />
            {selectedFile ? `Upload ${selectedFile.name}` : 'Upload Resume'}
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-shadow">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Accepted formats</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
              Only PDF files are accepted. Maximum file size is 5MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
