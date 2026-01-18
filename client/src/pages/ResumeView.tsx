import { useResumes, useResume } from "@/hooks/use-resumes";
import { Sidebar } from "@/components/Sidebar";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";

export default function ResumeView() {
  const [, params] = useRoute("/resume/:id");
  const id = params?.id ? parseInt(params.id) : null;

  const { data: resumes = [], isLoading: isLoadingResumes } = useResumes();
  const { data: resume, isLoading: isLoadingResume } = useResume(id);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <div className="hidden md:block">
        <Sidebar resumes={resumes} isLoading={isLoadingResumes} />
      </div>

      <main className="flex-1 overflow-y-auto h-screen relative">
        {isLoadingResume ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium animate-pulse">Loading analysis...</p>
            </div>
          </div>
        ) : resume ? (
          <AnalysisDashboard resume={resume} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-center">
               <h2 className="text-2xl font-bold text-foreground">Resume Not Found</h2>
               <p className="text-muted-foreground mt-2">The analysis you are looking for does not exist.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
