# Sjy Cabs - Project Context & AGENTS Guide

This document provides complete project context, structure, and instructions for continuing development on **Sjy Cabs** in Antigravity.

---

## 1. Project Overview & Tech Stack
- **Project Name**: `Sjy Cabs`
- **Technology Stack**: Node.js / npm (`sjy-mobility`), Next.js, React, Tailwind CSS, TypeScript, Python
- **Package Details**: Dependencies: @supabase/ssr, @supabase/supabase-js, @vercel/kv, @vercel/postgres, chart.js, clsx, leaflet, lucide-react, next, react

---

## 2. Directory Structure Map
Below is the layout of the project:

```
- **Sjy Cabs/**
  - `Dockerfile`
  - `PROJECT_KNOWLEDGE.md`
  - `docker-compose.yml`
  - `next-env.d.ts`
  - `next.config.js`
  - `package-lock.json`
  - `package.json`
  - `postcss.config.js`
  - `requirements.txt`
  - `tailwind.config.js`
  - `tsconfig.json`
  - `tsconfig.tsbuildinfo`
  - **app/**
    - `globals.css`
    - `layout.tsx`
    - `page.tsx`
    - **track/**
    - **card/**
      - `page.tsx`
    - **driver/**
      - `page.tsx`
    - **admin/**
      - `page.tsx`
    - **user/**
      - `page.tsx`
    - **qr/**
      - `page.tsx`
    - **simulator/**
      - `page.tsx`
    - **api/**
    - **investor/**
      - `page.tsx`
    - **nda/**
      - `page.tsx`
    - **community/**
      - `page.tsx`
    - **pool/**
      - `layout.tsx`
      - `page.tsx`
  - **phase2_dispatch/**
    - `__init__.py`
    - `main.py`
    - `whatsapp_client.py`
    - **booking/**
      - `__init__.py`
      - `engine.py`
      - `routes.py`
    - **parsing/**
      - `__init__.py`
      - `llm_extractor.py`
      - ... (and more files)
    - **webhooks/**
      - `__init__.py`
      - ... (and more files)
  - **phase1_ingestion/**
    - `__init__.py`
    - ... (and more files)
```

### Key Files:
- `Dockerfile`
- `PROJECT_KNOWLEDGE.md`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `docker-compose.yml`
- `next-env.d.ts`
- `next.config.js`
- `package-lock.json`
- `package.json`
- `postcss.config.js`
- `requirements.txt`
- `tailwind.config.js`
- `tsconfig.json`
- `tsconfig.tsbuildinfo`

---

## 3. How to Run / Develop
- **Command / Method**: `python <main_script>.py`
- **Prerequisites**: Ensure standard runtime (Node.js & npm) is available.

---

## 4. Continuity & Next Steps for AI Agent
When working on this project under your new account:
1. Review the existing key files listed above.
2. Read any additional instructions or specs in the project root.
3. Continue feature development, UI updates, or bug fixes seamlessly.
