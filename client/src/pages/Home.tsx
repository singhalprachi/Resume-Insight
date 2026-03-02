import { useUploadResume } from "@/hooks/use-resumes";
import { ResumeUploader } from "@/components/ResumeUploader";
import { useLocation } from "wouter";
import { FileText, Star, Zap, LayoutDashboard, Briefcase } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Home() {
  const { mutateAsync: uploadResume, isPending: isUploading } = useUploadResume();
  const [, setLocation] = useLocation();
  const [jobDescription, setJobDescription] = useState("");

  const handleUpload = async (file: File) => {
    try {
      console.log("Starting upload for file:", file.name);
      const result = await uploadResume({ file, jobDescription });
      console.log("Upload successful, result:", result);
      if (result && result.id) {
        setLocation(`/resume/${result.id}`);
      } else {
        throw new Error("Invalid response from server: Missing ID");
      }
    } catch (error: any) {
      console.error("Upload failed in Home.tsx:", error);
      const errorMessage = error.response?.data?.message || error.message || "Could not analyze resume. Please try again.";
      import("@/hooks/use-toast").then(({ toast }) => {
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-card flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">ResuMate</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-400/5 blur-3xl" />
            </div>

            <div className="w-full max-w-4xl relative z-10 space-y-12">
              <div className="text-center space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground">
                  Optimize Your Resume with <br />
                  <span className="text-gradient">AI-Powered Insights</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Get detailed feedback on your resume instantly. Uncover your strengths, 
                  fix weaknesses, and beat the ATS systems.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Briefcase className="w-5 h-5" />
                    <Label htmlFor="jd" className="text-lg">Target Job Description (Optional)</Label>
                  </div>
                  <Textarea
                    id="jd"
                    placeholder="Paste the job description here for a more targeted analysis..."
                    className="h-[300px] bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl focus-visible:ring-primary/20 resize-none text-base"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground italic">
                    Tip: Providing a job description helps our AI calculate a more accurate matching score.
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="bg-card rounded-3xl p-8 shadow-2xl shadow-primary/10 border border-border/50 backdrop-blur-sm h-fit">
                    <ResumeUploader onUpload={handleUpload} isUploading={isUploading} />
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-border/40">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground">Instant Analysis</h3>
                  <p className="text-sm text-muted-foreground">Get results in seconds, not days.</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground">ATS Optimization</h3>
                  <p className="text-sm text-muted-foreground">Check compatibility with screening bots.</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground">Actionable Feedback</h3>
                  <p className="text-sm text-muted-foreground">Clear steps to improve your score.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-muted/20">
            <p className="text-xs text-center text-muted-foreground">
              &copy; {new Date().getFullYear()} ResuMate AI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
