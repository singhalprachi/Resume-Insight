import { Link, useLocation } from "wouter";
import { Resume } from "@shared/schema";
import { cn } from "@/lib/utils";
import { FileText, Plus, ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  resumes: Resume[];
  isLoading: boolean;
}

export function Sidebar({ resumes, isLoading }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="w-full md:w-64 lg:w-72 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">ResuMate</span>
        </div>

        <Link href="/">
          <Button 
            className="w-full justify-start gap-2 shadow-md hover:shadow-lg transition-all" 
            size="lg"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      <Separator />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            History
          </h3>
        </div>
        
        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-2">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
              ))
            ) : resumes.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-muted-foreground">No analyses yet.</p>
              </div>
            ) : (
              resumes.map((resume) => {
                const isActive = location === `/resume/${resume.id}`;
                return (
                  <Link key={resume.id} href={`/resume/${resume.id}`}>
                    <div className={cn(
                      "group flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent",
                      isActive 
                        ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                        <span className="truncate">{resume.filename}</span>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200",
                        isActive ? "opacity-100 translate-x-0" : "group-hover:opacity-50 group-hover:translate-x-0"
                      )} />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t border-border bg-muted/20">
        <p className="text-xs text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} ResuMate AI
        </p>
      </div>
    </div>
  );
}
