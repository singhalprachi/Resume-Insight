import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import multer from "multer";
import mammoth from "mammoth";
import OpenAI from "openai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  console.log("Registering routes...");

  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // Resume Upload & Analysis
  app.post(api.resumes.upload.path, upload.single('file'), async (req, res) => {
    console.log(`POST ${api.resumes.upload.path} hit`);

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const sessionId = req.body.sessionId || "anonymous";
      const jobDescription = req.body.jobDescription || "";
      let text = "";

      // Text Extraction
      if (file.mimetype === "application/pdf") {
        try {
          console.log("Extracting text from PDF...");
          const data = await pdfParse(file.buffer);
          text = data.text;
          if (!text || text.trim().length === 0) {
            return res.status(400).json({
              message: "The uploaded PDF appears to be empty or unreadable.",
            });
          }
        } catch (err) {
          console.error("PDF parse failed:", err);
          return res.status(400).json({
            message: "Could not extract text from the provided PDF.",
          });
        }
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        try {
          console.log("Extracting text from DOCX...");
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          text = result.value;
          if (!text || text.trim().length === 0) {
            return res.status(400).json({
              message: "The uploaded DOCX appears to be empty or unreadable.",
            });
          }
        } catch (err) {
          console.error("DOCX parse failed:", err);
          return res.status(400).json({
            message: "Could not extract text from the provided DOCX file.",
          });
        }
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload PDF or DOCX." });
      }

      console.log("Calling OpenAI with model: gpt-4o-mini. API Key present:", !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
      
      const systemPrompt = `You are an advanced ATS Resume Analysis Engine.
Your task is to generate a highly intelligent ATS score and structured feedback.

INPUT:
- Resume Text (mandatory)
- Job Description Text (optional)

SCORING LOGIC REQUIREMENTS:
1. Required Skill High Weight: If JD provided, extract REQUIRED skills (2x weight). If not, infer industry skills.
2. Frequency Multiplier: Increase strength for repeated skills (cap at 3 mentions).
3. Real-World Validation: Higher weight for skills in projects/experience vs just listed.
4. Project Alignment: Match keywords/tech with JD domain.
5. Recency: Recent skills get higher weight.
6. Final Score (0-100): 
   (Skill Match x 0.45) + (Project Alignment x 0.30) + (Keyword Opt x 0.15) + (Recency x 0.10)

OUTPUT FORMAT (JSON ONLY):
{
  "atsScore": number,
  "skillMatchBreakdown": {
    "requiredSkillsMatch": number,
    "preferredSkillsMatch": number,
    "missingCriticalSkills": string[]
  },
  "projectAlignmentScore": number,
  "impactfulSkills": string[],
  "highFrequencySkills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "improvementSuggestions": string[],
  "marketReadinessScore": number,
  "targetRoles": string[],
  "skills": string[]
}

If JD not provided: Use the "atsScore" field to represent the “Core Role Strength Score” and provide Market Readiness Score/Target Roles.
Return ONLY JSON.`;

      const userPrompt = `RESUME TEXT:
${text}

JOB DESCRIPTION TEXT:
${jobDescription || "Not provided"}`;

      // OpenAI Analysis
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const analysisContent = response.choices[0].message.content;
      console.log("OpenAI response received:", analysisContent);

      if (!analysisContent) throw new Error("Failed to get analysis from AI");

      let analysis;
      try {
        // Strip markdown code blocks and ensure valid JSON
        const cleanedContent = analysisContent.replace(/```json\n?|\n?```/g, "").trim();
        console.log("Parsing cleaned analysis content:", cleanedContent);
        analysis = JSON.parse(cleanedContent);
        
        // Robust field validation and defaults to prevent frontend crashes
        analysis.atsScore = typeof analysis.atsScore === 'number' ? analysis.atsScore : 0;
        analysis.strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
        analysis.weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
        analysis.improvementSuggestions = Array.isArray(analysis.improvementSuggestions) ? analysis.improvementSuggestions : [];
        analysis.skills = Array.isArray(analysis.skills) ? analysis.skills : [];
        analysis.marketReadinessScore = typeof analysis.marketReadinessScore === 'number' ? analysis.marketReadinessScore : 0;
        analysis.projectAlignmentScore = typeof analysis.projectAlignmentScore === 'number' ? analysis.projectAlignmentScore : 0;

        // Ensure skillMatchBreakdown exists with defaults
        if (!analysis.skillMatchBreakdown || typeof analysis.skillMatchBreakdown !== 'object') {
          analysis.skillMatchBreakdown = {
            requiredSkillsMatch: 0,
            preferredSkillsMatch: 0,
            missingCriticalSkills: []
          };
        } else {
          analysis.skillMatchBreakdown.requiredSkillsMatch = typeof analysis.skillMatchBreakdown.requiredSkillsMatch === 'number' ? analysis.skillMatchBreakdown.requiredSkillsMatch : 0;
          analysis.skillMatchBreakdown.preferredSkillsMatch = typeof analysis.skillMatchBreakdown.preferredSkillsMatch === 'number' ? analysis.skillMatchBreakdown.preferredSkillsMatch : 0;
          analysis.skillMatchBreakdown.missingCriticalSkills = Array.isArray(analysis.skillMatchBreakdown.missingCriticalSkills) 
            ? analysis.skillMatchBreakdown.missingCriticalSkills 
            : [];
        }
      } catch (parseError) {
        console.error("Failed to parse OpenAI response as JSON:", analysisContent);
        throw new Error("Invalid AI response format");
      }

      // Save to DB
      console.log("Preparing to save resume to DB...");
      const resume = await storage.createResume({
        sessionId,
        filename: file.originalname,
        content: text,
        jobDescription: jobDescription || null,
        analysis: analysis
      });

      console.log("Analysis successfully saved to database for ID:", resume.id);
      res.status(201).json(resume);

    } catch (error) {
      console.error("Resume analysis error:", error);
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });

  // Get Resumes List
  app.get(api.resumes.list.path, async (req, res) => {
    const sessionId = (req.query.sessionId as string) || "anonymous";
    const resumes = await storage.getResumes(sessionId);
    res.json(resumes);
  });

  // Get Single Resume
  app.get(api.resumes.get.path, async (req, res) => {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const resume = await storage.getResume(id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  });

  return httpServer;
}
