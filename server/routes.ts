import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import multer from "multer";
import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";
import OpenAI from "openai";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  console.log("Registering routes...");
  console.log("OPENAI_API_KEY status:", process.env.OPENAI_API_KEY ? "Loaded" : "Not found");

  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // Resume Upload & Analysis
  app.post(api.resumes.upload.path, upload.single('file'), async (req, res) => {
    console.log(`POST ${api.resumes.upload.path} hit`);
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const sessionId = req.body.sessionId || "anonymous";
      let extractedText = "";

      // Text Extraction
      if (req.file.mimetype === 'application/pdf') {
        const data = await (pdfParse as any).default(req.file.buffer);
        extractedText = data.text;
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload PDF or DOCX." });
      }

      if (!extractedText || extractedText.trim().length === 0) {
        return res.status(400).json({ message: "Could not extract text from file." });
      }

      console.log("Calling OpenAI with model: gpt-4o-mini");
      // OpenAI Analysis
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert Resume Analyzer and Career Coach. 
            Analyze the provided resume text and extract the following in JSON format:
            - skills: Array of key technical and soft skills found.
            - strengths: Array of 3-5 strong points about the candidate.
            - weaknesses: Array of 3-5 areas for improvement or missing key elements.
            - atsScore: A number between 0-100 estimating how well-formatted and keyword-rich the resume is for ATS.
            - improvementSuggestions: Array of 3-5 actionable specific tips to improve the resume.
            
            Return ONLY the JSON object. Do not wrap in markdown code blocks.`
          },
          {
            role: "user",
            content: extractedText
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysisContent = response.choices[0].message.content;
      console.log("OpenAI raw response received");
      if (!analysisContent) {
        throw new Error("Failed to get analysis from AI");
      }

      let analysis;
      try {
        analysis = JSON.parse(analysisContent);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response as JSON:", analysisContent);
        throw new Error("Invalid AI response format");
      }

      // Save to DB
      const resume = await storage.createResume({
        sessionId,
        filename: req.file.originalname,
        content: extractedText,
        analysis: analysis
      });

      res.status(201).json(resume);

    } catch (error) {
      console.error("Resume analysis error:", error);
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });

  // Get Resumes List
  app.get(api.resumes.list.path, async (req, res) => {
    const sessionId = req.query.sessionId as string || "anonymous";
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
