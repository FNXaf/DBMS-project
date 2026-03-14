# Meowtopia Backend (Node + Express + MySQL)

This backend replaces the frontend localStorage mock and provides real REST APIs for auth, cats, and adoptions.

## 1. Setup

1. Open terminal in `backend`.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from `.env.example` and fill your MySQL values.

## 2. Setup Database

Run these SQL files in order:

1. `database/schema.sql`
2. `database/seed.sql`

## 3. Start Backend

```bash
npm run dev
```

Server default: `http://localhost:5000`

## 4. API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Cats
- `GET /api/cats`
- `GET /api/cats/:catid`
- `POST /api/cats` (admin, multipart/form-data supports `photo` file)
- `PUT /api/cats/:catid` (admin, multipart/form-data supports `photo` file)
- `DELETE /api/cats/:catid` (admin)

### Adoptions
- `POST /api/adoptions` (user)
- `GET /api/adoptions/my` (user)
- `GET /api/adoptions` (admin)
- `PUT /api/adoptions/:id/status` (admin)

## 5. Notes

- Auth is JWT-based; frontend stores token in localStorage.
- Cat photo uploads are saved in `backend/public/uploads/cats`.
- Age is derived from `dob` in SQL using `TIMESTAMPDIFF`.
