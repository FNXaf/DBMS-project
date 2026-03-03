# Meowtopia Backend Prompt

## Context
You are helping build the **backend** of Meowtopia, a cat adoption platform built as an academic DBMS project. The platform is **adoption-only** -- there is no food store, no shopping cart, no purchases. The backend handles all business logic, communicates with the database, and serves data to the frontend via a REST API.

For full system context (entities, features, user types), refer to the **Main System Prompt**. This prompt is focused on what the backend needs to implement.

---

## Tech Stack
| Part | Recommendation |
|------|---------------|
| Runtime | Node.js with Express |
| Database | MySQL |
| Auth | JWT tokens (simple, stateless) or session-based |
| Password Hashing | bcrypt |
| File Uploads | multer |

Keep it simple -- this is an academic project, not production.

---

## API Endpoints to Implement

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT or session |
| GET | `/api/auth/me` | Get current logged-in user info |

### Cats
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cats` | Get all cats (with optional filters -- see below) |
| GET | `/api/cats/:catid` | Get a single cat's full details (include computed age from DOB) |
| POST | `/api/cats` | Admin only -- Add a new cat (requires `shelter_name`, `dob`, etc.) |
| PUT | `/api/cats/:catid` | Admin only -- Update cat info |
| DELETE | `/api/cats/:catid` | Admin only -- Remove a cat listing |

#### Cat Filtering & Sorting
The `GET /api/cats` endpoint should support these query parameters:
| Parameter | Type | Behavior |
|-----------|------|----------|
| `gender` | String (`Male` / `Female`) | Single-value filter |
| `fur_color` | Comma-separated strings | Multi-value filter (OR logic) |
| `breed` | Comma-separated strings | Multi-value filter (OR logic) |
| `age_min` | Number (months) | Minimum age -- computed from DOB |
| `age_max` | Number (months) | Maximum age -- computed from DOB |
| `cattitude` | Comma-separated strings | Multi-value filter (OR logic) |
| `health_status` | String | Single-value filter |
| `sort` | String | Sort order (see options below) |

**Sort options:**
- `age_asc` -- Age youngest first
- `age_desc` -- Age oldest first
- `date_desc` -- Date added newest first
- `date_asc` -- Date added oldest first
- `gender_asc` -- Gender (Female first)
- `gender_desc` -- Gender (Male first)
- `breed_asc` -- Breed A to Z
- `breed_desc` -- Breed Z to A
- `health_vacc` -- Vaccination status (vaccinated first)
- `status_avail` -- Adoption status (available first)

> **Age computation:** Since the DB stores `dob` (not age), the backend must compute age using `TIMESTAMPDIFF(MONTH, dob, CURDATE())` or equivalent for filtering and display.

All cat API responses should include a computed `age_months` field derived from `dob`.

### Adoptions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/adoptions` | Submit adoption form (logged-in users only) |
| GET | `/api/adoptions/my` | Get all adoptions for the logged-in user |
| GET | `/api/adoptions` | Admin only -- Get all adoption records |
| PUT | `/api/adoptions/:id/status` | Admin only -- Update adoption status |

---

## Business Logic to Handle

### Adoption Flow
1. User submits adoption form with: `catid`, `cat_name_given`, `pickup_method`, user details
2. Backend:
   - Verifies the cat is still available (`is_available = true`)
   - Creates an adoption record (status: `Pending`)
   - Marks the cat as unavailable (`is_available = false`)
   - Returns the adoption record + pickup method -> frontend uses this to display the congratulations popup

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

---

## Database Interaction Notes
- Use parameterized queries (never raw string interpolation -- even for an academic project, this is good habit)
- The database schema, triggers, and views are defined separately in the **Database Prompt**
- The backend should trust that triggers (e.g., auto-updating cat availability) are handled at the DB level -- no need to duplicate that logic in code
- Use transactions where multiple DB operations must succeed together (e.g., creating adoption + updating cat availability)

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
- `200` -- OK
- `201` -- Created
- `400` -- Bad request (invalid input)
- `401` -- Unauthorized (not logged in)
- `403` -- Forbidden (not admin)
- `404` -- Not found
- `409` -- Conflict (e.g., duplicate `shelter_name`)
- `500` -- Server error

---

## Validation Rules
| Field | Rule |
|-------|------|
| `shelter_name` | Required, unique -- return `409` if duplicate |
| `dob` | Required, must be a valid date in the past |
| `email` | Required, unique, valid format |

---

## Cat Photo Uploads
The frontend currently stores cat photos as **base64 data URLs** in `localStorage` (for the static mock phase). When the backend is connected:
- Use `multer` to accept file uploads on `POST /api/cats` and `PUT /api/cats/:catid`
- Store files in `/public/uploads/cats/` and save only the file path in the DB
- The admin can also select a **crop position** (`center`, `top`, `bottom`) which maps to CSS `object-position`. Store this as a `photo_position` column in the `Cat` table (default: `center`).
- Return both `photo_url` and `photo_position` in all cat API responses.

---

## What to Keep Simple (Academic Project)
- No email verification or password reset flows needed
- No rate limiting or advanced security needed
- No caching (Redis, etc.) needed
- No food store, no shopping cart, no purchases -- adoption-only
- You don't need to write tests, but keep functions small and readable

---

## Notes for the Team
- Either student (Shlok or Sam) might be writing backend code in different sessions -- always ask what routes/files already exist before creating new ones to avoid conflicts
- If a new feature is requested, add a new route -- don't modify existing ones unless asked
- Comment your code -- your professor will read it
