# ResuMate - AI Resume Analyzer

## Overview

ResuMate is an AI-powered resume analysis application that helps users optimize their resumes for job applications. Users can upload PDF or DOCX resumes, which are then analyzed using OpenAI's API to extract skills, identify strengths and weaknesses, calculate an ATS (Applicant Tracking System) compatibility score, and provide actionable improvement suggestions.

The application follows a full-stack TypeScript architecture with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for page transitions and UI animations
- **Charts**: Recharts for visualizing ATS scores with radial charts
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared for shared)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES Modules
- **API Pattern**: RESTful API with typed routes defined in shared/routes.ts
- **File Processing**: Multer for file uploads, mammoth for DOCX parsing, pdf-parse for PDF extraction
- **AI Integration**: OpenAI API for resume analysis

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with migrations stored in /migrations folder
- **Key Tables**: 
  - `resumes` - stores uploaded resumes with extracted content and AI analysis
  - `conversations` and `messages` - for chat functionality (Replit AI integrations)

### Session Management
- Client-side session ID stored in localStorage (no forced authentication)
- Session ID passed with resume uploads to associate resumes with anonymous users

### Build System
- **Development**: tsx for running TypeScript directly
- **Production Build**: esbuild for server bundling, Vite for client bundling
- **Output**: dist/public for client assets, dist/index.cjs for server

### Replit AI Integrations
The project includes pre-built integrations in `server/replit_integrations/` for:
- **Chat**: Text-based conversations with OpenAI
- **Image**: Image generation with gpt-image-1
- **Audio**: Voice chat with speech-to-text and text-to-speech

## External Dependencies

### AI Services
- **OpenAI API**: Used for resume analysis (GPT models) and integrated chat/image/audio features
- **Environment Variables**: 
  - `OPENAI_API_KEY` - for resume analysis
  - `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` - for Replit AI integrations

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Document Processing
- **pdf-parse**: Extracts text from PDF files
- **mammoth**: Converts DOCX files to text

### UI Components
- **shadcn/ui**: Complete component library with Radix UI primitives
- **Lucide React**: Icon library
- **react-dropzone**: File upload drag-and-drop interface