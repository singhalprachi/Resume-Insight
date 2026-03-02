import { db } from "./db";
import { resumes, type Resume, type InsertResume } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat/storage";

export interface IStorage extends IChatStorage {
  createResume(resume: InsertResume & { analysis: any }): Promise<Resume>;
  getResumes(sessionId: string): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Chat storage delegation
  async getConversation(id: number) { return chatStorage.getConversation(id); }
  async getAllConversations() { return chatStorage.getAllConversations(); }
  async createConversation(title: string) { return chatStorage.createConversation(title); }
  async deleteConversation(id: number) { return chatStorage.deleteConversation(id); }
  async getMessagesByConversation(conversationId: number) { return chatStorage.getMessagesByConversation(conversationId); }
  async createMessage(conversationId: number, role: string, content: string) { return chatStorage.createMessage(conversationId, role, content); }

  // Resume storage
  async createResume(resume: InsertResume & { analysis: any }): Promise<Resume> {
    const data = {
      ...resume,
      analysis: typeof resume.analysis === 'string' ? JSON.parse(resume.analysis) : resume.analysis
    };
    const [newResume] = await db.insert(resumes).values(data).returning();
    return newResume;
  }

  async getResumes(sessionId: string): Promise<Resume[]> {
    return await db.select().from(resumes)
      .where(eq(resumes.sessionId, sessionId))
      .orderBy(desc(resumes.createdAt));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }
}

export const storage = new DatabaseStorage();
