# ⚙️ Meowtopia — Backend Prompt

## Context
You are helping build the **backend** of Meowtopia, a cat adoption platform built as an academic DBMS project. The backend handles all business logic, communicates with the database, and serves data to the frontend via a REST API.

For full system context (entities, features, user types), refer to the **Main System Prompt**. This prompt is focused on what the backend needs to implement.

---

## Tech Stack
| Part | Recommendation |
|------|---------------|
| Runtime | Node.js with Express (or Python with Flask — team's choice) |
| Database | MySQL or PostgreSQL |
| Auth | JWT tokens (simple, stateless) or session-based |
| Password Hashing | bcrypt |
| File Uploads | multer (Node) or Flask's file handling |

Keep it simple — this is an academic project, not production.

---

## API Endpoints to Implement

### 🔐 Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT or session |
| GET | `/api/auth/me` | Get current logged-in user info |

### 🐱 Cats
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cats` | Get all available cats (with optional filters: breed, gender, age) |
| GET | `/api/cats/:catid` | Get a single cat's full details |
| POST | `/api/cats` | Admin only — Add a new cat |
| PUT | `/api/cats/:catid` | Admin only — Update cat info |
| DELETE | `/api/cats/:catid` | Admin only — Remove a cat listing |

### 📋 Adoptions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/adoptions` | Submit adoption form (logged-in users only) |
| GET | `/api/adoptions/my` | Get all adoptions for the logged-in user |
| GET | `/api/adoptions` | Admin only — Get all adoption records |
| PUT | `/api/adoptions/:id/status` | Admin only — Update adoption status |

### 🍽️ Food
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/food` | Get all food items |
| GET | `/api/food/cat/:catid` | Get food preferences for a specific cat |
| POST | `/api/food` | Admin only — Add food item |
| PUT | `/api/food/:foodid` | Admin only — Update food item |
| DELETE | `/api/food/:foodid` | Admin only — Delete food item |

### 🏡 Owner Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/my-cats` | Returns all adopted cats of the logged-in user, with food suggestions per cat |

---

## Business Logic to Handle

### Adoption Flow
1. User submits adoption form with: `catid`, `cat_name_given`, `pickup_method`, user details
2. Backend:
   - Verifies the cat is still available (`is_available = true`)
   - Creates an adoption record (status: `Pending`)
   - Marks the cat as unavailable (`is_available = false`)
   - Fetches the cat's food preferences
   - Returns the adoption record + food preference list + pickup method → frontend uses this to display the cute popup

### Owner Check
- A user is considered a **Cat Owner** if they have at least one adoption with status `Completed` or `Approved`
- The `/api/dashboard/my-cats` route should verify this — if no qualifying adoptions, return a `403` or a message

### Role-Based Access Control (RBAC)
- Middleware to check if user is authenticated (JWT/session check)
- Middleware to check if user is an admin (`role === 'admin'`)
- Apply these to protected routes

---

## Middleware to Write
| Middleware | Purpose |
|-----------|---------|
| `authMiddleware` | Verifies JWT token or session; attaches user to request |
| `adminMiddleware` | Extends authMiddleware; checks if `user.role === 'admin'` |
| `ownerMiddleware` | Checks if the user has at least one adoption |

---

## Database Interaction Notes
- Use parameterized queries (never raw string interpolation — even for an academic project, this is good habit)
- The database schema, triggers, and views are defined separately in the **Database Prompt**
- The backend should trust that triggers (e.g., auto-updating cat availability) are handled at the DB level — no need to duplicate that logic in code
- Use transactions where multiple DB operations must succeed together (e.g., creating adoption + updating cat availability)

Example transaction scenario:
```
BEGIN;
  INSERT INTO Adoption (...) VALUES (...);
  UPDATE Cat SET is_available = false WHERE catid = ?;
COMMIT;
```
> Note: The DB trigger may handle the UPDATE automatically — check the database prompt to avoid double-updating.

---

## File Upload (Cat Photos)
- Use `multer` (Node) to handle photo uploads when admin adds/edits a cat
- Save files to a `/public/uploads/cats/` folder
- Store only the file path/name in the database, not the binary data
- Return the image URL in API responses so the frontend can render it

---

## Error Handling
Return consistent JSON error responses:
```json
{
  "success": false,
  "message": "Cat not found"
}
```
And for success:
```json
{
  "success": true,
  "data": { ... }
}
```

Common HTTP status codes to use:
- `200` — OK
- `201` — Created
- `400` — Bad request (invalid input)
- `401` — Unauthorized (not logged in)
- `403` — Forbidden (not admin/owner)
- `404` — Not found
- `500` — Server error

---

## What to Keep Simple (Academic Project)
- No email verification or password reset flows needed
- No rate limiting or advanced security needed
- No caching (Redis, etc.) needed
- Static food suggestions are okay if the relationship data isn't fully set up yet
- You don't need to write tests, but keep functions small and readable

---

## Notes for the Team
- Either student (you or Sam) might be writing backend code in different sessions — always ask what routes/files already exist before creating new ones to avoid conflicts
- If a new feature is requested, add a new route — don't modify existing ones unless asked
- Comment your code — your professor will read it
