# Findora — AI-powered item recovery

Findora extends the existing React + Express + Prisma application. It keeps the current PostgreSQL database, JWT authentication, item/category models, claims, admin tools and AI service, while adding persistent match candidates, private ownership verification and secure handover confirmation.

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Redux Toolkit Query, React Router
- Backend: Node.js, Express, TypeScript, Prisma 6, PostgreSQL
- AI: Existing FastAPI service with SentenceTransformers and CLIP; optional semantic text scoring with a conventional fuzzy fallback
- Image storage: signed Cloudinary upload when configured; local disk for development
- Handover email: Resend (optional but required to start OTP handover)

## Local setup

### 1. PostgreSQL and backend

Use the existing PostgreSQL database. Do not create a replacement database. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL`, `JWT_SECRETS`, `PHONE_MATCH_SECRET`, and `CLIENT_URL`.

```bash
cd server
npm install
npx prisma generate
```

The repository did not include a prior Prisma migration history. The new migration is additive and assumes the existing `users`, `lostItems`, `foundItems`, `claims`, and `itemsCategories` tables already exist. Back up the database and test against a staging copy before applying it:

```bash
npx prisma migrate deploy
npm run build
npm test
npm start
```

The API listens on `http://localhost:5001` by default.

### 2. Frontend

Copy `frontend/.env.example` to `frontend/.env` and set `VITE_SERVER_URL=http://localhost:5001`.

```bash
cd frontend
npm install
npm run build
npm run dev
```

Open `http://localhost:5173`.

### 3. Optional AI service

The existing FastAPI service remains optional. Without it, matching uses the built-in fuzzy/lexical engine.

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

Set `AI_SERVICE_URL=http://127.0.0.1:8001` in `server/.env` to enable SentenceTransformer semantic text scoring. The FastAPI service downloads model weights at first use.

## New recovery workflow

1. Authenticated users report lost or found items with an image, description, location, date and contact details.
2. Lost reports can include three private ownership questions and answers. Answers are bcrypt-hashed and never included in public item APIs.
3. New reports automatically rank up to ten candidates. The matching engine uses item name (15), description (15), location (10), contact name (7) and exact phone match (8), reweighting only available signals. Ownership answers are excluded from initial ranking.
4. The finder can view the private questions only for a sufficiently strong candidate and submit answers. Five incorrect attempts lock verification for 15 minutes.
5. Successful verification moves the match to `MATCHED` / `READY TO BE RECEIVED`. A one-time code is emailed to the lost-item reporter.
6. The finder confirms the code after physical handover. Only then are the item records marked `RECEIVED`.

Potential matches and notifications are persisted. AI scores are ranking signals, not proof of ownership.

## Storage and email configuration

For persistent production images, set all three Cloudinary values:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

If these are absent, uploads use `server/uploads/` on local disk. Serverless filesystems (including standard Vercel functions) are ephemeral, so configure Cloudinary or a persistent volume before production uploads.

For email-based handover OTPs, configure:

- `RESEND_API_KEY`
- `EMAIL_FROM` (a sender/domain verified in Resend)

If email is not configured, reporting and matching still work, but the handover OTP flow returns an explicit configuration error and does not mark an item received.

## CSV import

Admins can import up to 100 CSV rows at `/dashboard/dataset`. Required columns: `type,userEmail,categoryName,itemName,description,location,date`. Optional columns: `imageUrl,contactName,contactPhone,claimProcess`. The import uses existing users and categories and triggers conventional matching. XLSX parsing is not included because the repository has no spreadsheet parser dependency.

## Environment templates

- Backend: `server/.env.example`
- Frontend: `frontend/.env.example`

Never commit `.env` files or production secrets.

## Validation

The pure matching logic has five Node tests (`cd server && npm test`). Run `npm run build` in both `server/` and `frontend/` after installing dependencies. Prisma validation and migration deployment must be run against the configured PostgreSQL database; they cannot be validated without the database connection.
