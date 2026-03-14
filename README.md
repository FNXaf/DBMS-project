# Meowtopia DBMS Project - Full Run Guide

This repo now has:
- Frontend: static HTML/CSS/JS in `frontend`
- Backend: Node.js + Express API in `backend`
- Database SQL: MySQL scripts in `database`

## 1. What to run (short answer)

- Backend: yes, run `npm run dev` in `backend`
- Frontend: no npm needed (it is static). Run with VS Code Live Server, or a static server command.

## 2. Backend setup and run

From project root:

```powershell
cd backend
npm install
npm run dev
```

Backend will run at:
- `http://localhost:5000`

Health check endpoint:
- `GET http://localhost:5000/api/health`

## 3. Database setup (MySQL)

Run SQL in this exact order:
1. `database/schema.sql`
2. `database/seed.sql`

You can run them in MySQL Workbench, or via CLI:

```powershell
mysql -u root -p < ..\database\schema.sql
mysql -u root -p < ..\database\seed.sql
```

## 4. Backend env file

Backend uses:
- `backend/.env`

Already created for you. Update at least:
- `DB_PASSWORD`
- `JWT_SECRET`

If your frontend runs on another port, update:
- `FRONTEND_ORIGIN`

## 5. Frontend run

### Option A: VS Code Live Server (easy)
- Open `frontend/index.html`
- Click `Go Live`

### Option B: static server from terminal
If you have Node installed:

```powershell
npx serve frontend
```

Then open the URL printed by `serve`.

## 6. Run both at same time

Use two terminals:

Terminal 1 (backend):
```powershell
cd backend
npm run dev
```

Terminal 2 (frontend):
- Start Live Server in VS Code, or:
```powershell
npx serve frontend
```

## 7. Local network hosting (same Wi-Fi)

If you want your girlfriend to open from another device on same network:

1. Find your PC LAN IP:
```powershell
ipconfig
```
Use IPv4 (example: `192.168.1.23`).

2. Start backend normally (`npm run dev`).
3. Serve frontend.
4. In `backend/.env`, set:
```env
FRONTEND_ORIGIN=http://192.168.1.23:5500
```
(Use the actual frontend port.)

5. Open firewall for Node/port 5000 if asked by Windows.

Then frontend can call backend at `http://192.168.1.23:5000` only if code points there. If needed, set this in browser before opening pages:

```js
window.MEOWTOPIA_API_BASE = 'http://192.168.1.23:5000/api'
```

## 8. Internet hosting options (for demo)

### Backend hosting (easy): Render or Railway
- Push this repo to GitHub.
- Create new Web Service.
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add env vars from `backend/.env`.
- Use a hosted MySQL DB (Aiven, Railway MySQL, PlanetScale, etc.).

### Frontend hosting
- Easiest: Netlify or Vercel static deploy from `frontend` folder.
- If deployed separately, set backend CORS origin in hosted backend env.

## 9. Git push/pull workflow

Because you said you want everything available when your girlfriend pulls:

```powershell
git add .
git commit -m "Setup full backend, database, and frontend API integration"
git push
```

On her machine:

```powershell
git pull
cd backend
npm install
npm run dev
```

She should also run database SQL on her MySQL and configure `backend/.env`.

## 10. Common command summary

From `backend` folder:

```powershell
npm install
npm run dev   # development (auto-restart via nodemon)
npm start     # production mode
```
