import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  // In a real app with auth, this would link to a users table
  // For this MVP without forced auth, we can make it optional or use a session ID
  sessionId: text("session_id").notNull(), 
  filename: text("filename").notNull(),
  content: text("content").notNull(), // Extracted text
  analysis: jsonb("analysis").$type<{
    skills: string[];
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
    improvementSuggestions: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({ 
  id: true, 
  createdAt: true,
  analysis: true 
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export * from "./models/chat";
