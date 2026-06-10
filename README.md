# LegalDoc

AI-powered legal document analysis platform for Indian law.

LegalDoc is a full-stack legal workbench with Supabase Auth, persistent document storage, PostgreSQL/pgvector retrieval, OpenAI-powered analysis, RAG chat, document history, and report export.

## Features

- Secure sign up, login, logout, forgot password, protected routes, and profile page with Supabase Auth.
- PDF, DOCX, and TXT upload with validation, Supabase Storage persistence, signed URLs, and per-user access control.
- PostgreSQL schema for users, documents, analyses, chat sessions, chat messages, audit logs, and document chunks.
- OpenAI GPT-4o analysis tools for summaries, clauses, risk scoring, plain English explanations, NDA generation, and contract drafting.
- RAG pipeline with parsing, chunking, `text-embedding-3-small`, pgvector semantic search, PostgreSQL keyword search, Reciprocal Rank Fusion, confidence scoring, and citations.
- Legal chat workspace for document-grounded Q&A.
- Dashboard history for recent documents, recent analyses, search, delete, and risk report visibility.
- PDF and DOCX report export.
- Production assets for Vercel, Render, Docker, and local PostgreSQL with pgvector.

## Architecture

- Frontend: Next.js App Router, TypeScript strict mode, Tailwind CSS, shadcn-style components.
- Backend: FastAPI, Pydantic models, service layer, repository layer, typed settings, Supabase JWKS JWT validation, rate limiting, structured error responses.
- Database: PostgreSQL with pgvector and row-level security.
- Auth and Storage: Supabase Auth and private Supabase Storage bucket.
- AI: OpenAI GPT-4o and `text-embedding-3-small`.

## Local Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Backend:

```bash
cd api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn index:app --reload --port 8000
```

Database:

```bash
docker compose up postgres
```

Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL editor or against a pgvector-enabled PostgreSQL database.

## Environment

Copy `.env.example` and configure:

- Supabase URL, anon key, service role key, JWKS URL, JWT audience, and storage bucket.
- PostgreSQL `DATABASE_URL`.
- OpenAI API key and model names.
- Frontend `NEXT_PUBLIC_API_URL`.

## Verification

```bash
npm run build
python -m compileall api
```

## Deployment

See `DEPLOYMENT.md` for Supabase, Render, and Vercel instructions.

## Resume Highlights

- Designed a production-ready AI legal workbench with authenticated multi-tenant document analysis.
- Built a RAG pipeline using pgvector semantic retrieval, keyword search, Reciprocal Rank Fusion, and GPT-4o grounded generation.
- Implemented secure file ingestion, document parsing, permanent storage, analysis persistence, legal chat, citations, and report exports.

## Disclaimer

LegalDoc is a legal research and drafting aid. It does not constitute legal advice. Outputs should be reviewed by a qualified legal professional before being relied upon.
