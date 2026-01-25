import { useResume } from "@/hooks/use-resumes";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { useRoute, Link } from "wouter";
import { Loader2, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumeView() {
  const [, params] = useRoute("/resume/:id");
  const id = params?.id ? parseInt(params.id) : null;

  const { data: resume, isLoading: isLoadingResume } = useResume(id);

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">ResuMate</span>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto relative">
        {isLoadingResume ? (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium animate-pulse">Loading analysis...</p>
            </div>
          </div>
        ) : resume ? (
          <AnalysisDashboard resume={resume} />
        ) : (
          <div className="min-h-[80vh] flex items-center justify-center">
             <div className="text-center">
               <h2 className="text-2xl font-bold text-foreground">Resume Not Found</h2>
               <p className="text-muted-foreground mt-2">The analysis you are looking for does not exist.</p>
               <Link href="/">
                 <Button className="mt-4">Upload a New Resume</Button>
               </Link>
             </div>
          </div>
        )}
      </main>

      <div className="p-4 border-t border-border bg-muted/20">
        <p className="text-xs text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} ResuMate AI
        </p>
      </div>
    </div>
  );
}
