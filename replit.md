# ResuMate

AI-powered ATS resume analysis application.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, Shadcn UI, Framer Motion
- Backend: Express, Node.js
- Database: PostgreSQL (Drizzle ORM)
- AI: OpenAI GPT-4o-mini (Replit Integration)

## Key Features
- PDF/DOCX resume upload
- Targeted analysis with job description
- ATS score calculation (Skill Match 45%, Project Alignment 30%, Keyword Opt 15%, Recency 10%)
- Detailed feedback: Strengths, Weaknesses, and Actionable Suggestions
- Skill matching breakdown

## Recent Changes
- Permanently removed "Professional Experience" section from AI analysis and UI.
- Updated ATS scoring weights to exclude professional years.
- Implemented robust AI response parsing to handle markdown and missing fields.
- Added detailed error logging and toast notifications for upload failures.