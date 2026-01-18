import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function ResumeUploader({ onUpload, isUploading }: ResumeUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      setError("Please upload a PDF or DOCX file under 5MB");
      return;
    }
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isUploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          isUploading ? "pointer-events-none opacity-80" : ""
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-display text-primary">Analyzing Resume...</h3>
                  <p className="text-muted-foreground">Our AI is extracting insights</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-4"
              >
                <div className={cn(
                  "p-6 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110",
                  isDragActive && "bg-primary/10"
                )}>
                  {isDragActive ? (
                    <Upload className="w-10 h-10 text-primary" />
                  ) : (
                    <FileText className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-foreground">
                    {isDragActive ? "Drop to Analyze" : "Upload Your Resume"}
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Drag & drop your PDF or DOCX file here, or click to browse.
                    <br />
                    <span className="text-xs text-muted-foreground/70">Max file size: 5MB</span>
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg mt-4"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/20 rounded-tl-lg transition-all group-hover:w-6 group-hover:h-6 group-hover:border-primary/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/20 rounded-tr-lg transition-all group-hover:w-6 group-hover:h-6 group-hover:border-primary/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/20 rounded-bl-lg transition-all group-hover:w-6 group-hover:h-6 group-hover:border-primary/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/20 rounded-br-lg transition-all group-hover:w-6 group-hover:h-6 group-hover:border-primary/50" />
      </div>
    </div>
  );
}
