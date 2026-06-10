# LegalDoc Deployment Guide

## Supabase

1. Create a Supabase project.
2. Enable email/password authentication.
3. Enable the `vector` extension.
4. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor.
5. Create a private Storage bucket named `legal-documents`.
6. Copy the project URL, anon key, service role key, and JWKS URL into environment variables.

## OpenAI

Set `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4o`, and `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`.

## Render API

Create a Render Web Service from the repo and use `render.yaml`.

Required API env vars:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWKS_URL`
- `SUPABASE_JWT_AUDIENCE`
- `SUPABASE_STORAGE_BUCKET`
- `CORS_ORIGINS`

## Vercel Frontend

Create a Vercel project for the Next app.

Required frontend env vars:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local Smoke Test

```bash
npm run build
cd api
python -m compileall app index.py
uvicorn index:app --reload --port 8000
```
