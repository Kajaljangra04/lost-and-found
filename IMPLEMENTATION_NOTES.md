# Findora implementation and verification notes

## What changed in this handoff

- Kept the existing React/Vite frontend, Express/TypeScript API, Prisma/PostgreSQL schema, authentication, admin screens, claims and FastAPI AI service.
- Added persistent match candidates and status tracking.
- Added private ownership questions with bcrypt-hashed answers and attempt lockouts.
- Added match inbox views for both lost-item reporters and finders.
- Added per-user notifications.
- Added email OTP handover confirmation with expiry and attempt limits.
- Added semantic text scoring through the existing FastAPI service, with deterministic fuzzy matching as a fallback.
- Updated report forms, search filters, home-page recovery journey, navigation and platform statistics.
- Added an additive PostgreSQL migration and environment examples.

## Verification performed for this archive

- TypeScript/TSX syntax transpilation: 94 source files checked, no syntax diagnostics.
- Matching logic checks: exact match, missing signals, phone mismatch, semantic score refinement and missing-value handling all passed.
- ZIP integrity check passed.
- A full TypeScript type-check, Prisma client generation/schema validation, frontend production build and database migration execution were **not** completed in this environment because project dependencies and a staging PostgreSQL database were not available. Run the commands below before deployment.

## Before deploying

1. Back up the existing PostgreSQL database and test the additive migration against a staging copy first.
2. In `server/`, install dependencies, generate Prisma Client, apply migrations and run the build/tests.
3. In `frontend/`, install dependencies and run the production build.
4. Configure `DATABASE_URL`, `JWT_SECRETS`, `PHONE_MATCH_SECRET`, `CLIENT_URL`, `PUBLIC_SERVER_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `AI_SERVICE_URL`, `RESEND_API_KEY` and `EMAIL_FROM` as appropriate.
5. Use Cloudinary or another persistent object store for production images. Local disk is only a development fallback on serverless platforms.
6. Verify the Resend sender domain before enabling handover OTP delivery.
7. Exercise registration/login, both report forms, public privacy filtering, match ranking, incorrect-answer lockout, successful verification, OTP expiry, incorrect OTP attempts and final receipt status in staging.

## Commands

Backend:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm test
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

AI service (optional):

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

The AI service is optional. If it is unavailable, matching falls back to the local fuzzy matching logic.
