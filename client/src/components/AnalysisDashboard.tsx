import { Resume } from "@shared/schema";
import { motion } from "framer-motion";
import { ScoreChart } from "./ScoreChart";
import { CheckCircle, XCircle, Lightbulb, Tag, Award, Target, TrendingUp, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface AnalysisDashboardProps {
  resume: Resume;
}

export function AnalysisDashboard({ resume }: AnalysisDashboardProps) {
  const { analysis } = resume;

  if (!analysis) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">{resume.filename}</h1>
          <p className="text-muted-foreground">Analysis generated on {new Date(resume.createdAt!).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          {resume.jobDescription && (
            <Badge variant="secondary" className="text-sm px-3 py-1 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
              Targeted Analysis
            </Badge>
          )}
          <Badge variant="outline" className="text-sm px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            Analyzed with AI
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Score & Skills */}
        <div className="space-y-6">
          <motion.div variants={item}>
            <Card className="h-full border-border/60 shadow-lg shadow-primary/5 overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  ATS Match Score
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ScoreChart score={analysis.atsScore || 0} />
                <div className="mt-4 space-y-4">
                  {analysis.marketReadinessScore && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Market Readiness</span>
                        <span className="font-bold">{analysis.marketReadinessScore}%</span>
                      </div>
                      <Progress value={analysis.marketReadinessScore} className="h-2" />
                    </div>
                  )}
                  {analysis.projectAlignmentScore !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Project Alignment</span>
                        <span className="font-bold">{analysis.projectAlignmentScore}%</span>
                      </div>
                      <Progress value={analysis.projectAlignmentScore} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {analysis.skillMatchBreakdown && (
            <motion.div variants={item}>
              <Card className="border-border/60 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Skill Matching
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Required Skills Match</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{analysis.skillMatchBreakdown.requiredSkillsMatch}%</span>
                    </div>
                    <Progress value={analysis.skillMatchBreakdown.requiredSkillsMatch} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preferred Skills Match</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{analysis.skillMatchBreakdown.preferredSkillsMatch}%</span>
                    </div>
                    <Progress value={analysis.skillMatchBreakdown.preferredSkillsMatch} className="h-2" />
                  </div>
                  {analysis.skillMatchBreakdown.missingCriticalSkills.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider">Missing Critical Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.skillMatchBreakdown.missingCriticalSkills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Card className="border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Top Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(analysis.skills || []).slice(0, 15).map((skill, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary"
                      className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                {(analysis.impactfulSkills || analysis.highFrequencySkills) && (
                  <div className="pt-4 border-t border-border/40 space-y-3">
                    {analysis.impactfulSkills && (
                      <div>
                        <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Most Impactful</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.impactfulSkills.slice(0, 5).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-primary/30 text-primary">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {analysis.targetRoles && analysis.targetRoles.length > 0 && (
            <motion.div variants={item}>
              <Card className="border-border/60 shadow-md bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    Suggested Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.targetRoles.map((role, i) => (
                      <Badge key={i} variant="outline" className="bg-white/50 dark:bg-black/20">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(analysis.strengths || []).map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span className="text-foreground/80">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <XCircle className="w-5 h-5" />
                  Weaknesses & Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(analysis.weaknesses || []).map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span className="text-foreground/80">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {analysis.experienceAnalysis && (
            <motion.div variants={item}>
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-muted/30 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40 min-w-[200px]">
                    <History className="w-8 h-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{analysis.experienceAnalysis.yearsDetected}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest text-center">Professional Experience</span>
                    <div className="mt-2 text-xs font-medium text-primary">
                      {analysis.experienceAnalysis.professionalMonths} Professional Mos
                    </div>
                    {analysis.experienceAnalysis.projectMonths > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-1">
                        + {analysis.experienceAnalysis.projectMonths} Mos Project Work
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <h4 className="font-bold mb-2">Experience Alignment</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.experienceAnalysis.alignment}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item}>
            <Card className="border-border/60 shadow-lg shadow-primary/5">
              <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lightbulb className="w-5 h-5" />
                  Actionable Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {(analysis.improvementSuggestions || []).map((suggestion, i) => (
                    <div key={i} className="group">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-foreground leading-relaxed">{suggestion}</p>
                        </div>
                      </div>
                      {i < (analysis.improvementSuggestions || []).length - 1 && (
                        <Separator className="my-4 opacity-50" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
