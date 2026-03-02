# ⚙️ Meowtopia — Backend Prompt

## Context
You are helping build the **backend** of Meowtopia, a cat adoption platform built as an academic DBMS project. The backend handles all business logic, communicates with the database, and serves data to the frontend via a REST API.

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
| GET | `/api/cats` | Get all available cats (with optional filters — see below) |
| GET | `/api/cats/:catid` | Get a single cat's full details (include computed age from DOB) |
| POST | `/api/cats` | Admin only — Add a new cat (requires `shelter_name`, `dob`, etc.) |
| PUT | `/api/cats/:catid` | Admin only — Update cat info |
| DELETE | `/api/cats/:catid` | Admin only — Remove a cat listing |

#### Cat Filtering & Sorting
The `GET /api/cats` endpoint should support these query parameters:
| Parameter | Type | Behavior |
|-----------|------|----------|
| `gender` | String (`Male` / `Female`) | Single-value filter |
| `fur_color` | Comma-separated strings | Multi-value filter (OR logic) |
| `breed` | Comma-separated strings | Multi-value filter (OR logic) |
| `age_min` | Number (months) | Minimum age — computed from DOB |
| `age_max` | Number (months) | Maximum age — computed from DOB |
| `cattitude` | Comma-separated strings | Multi-value filter (OR logic) |
| `health_status` | String | Single-value filter |
| `sort` | String | Sort order: `newest`, `oldest`, `name_asc`, `name_desc`, `youngest`, `oldest_age` |

> **Age computation:** Since the DB stores `dob` (not age), the backend must compute age using `TIMESTAMPDIFF(MONTH, dob, CURDATE())` or equivalent for filtering and display.

All cat API responses should include a computed `age_months` field derived from `dob`.

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
| GET | `/api/food` | Get all food items (with stock quantities) |
| GET | `/api/food/cat/:catid` | Get food preferences for a specific cat |
| POST | `/api/food` | Admin only — Add food item |
| PUT | `/api/food/:foodid` | Admin only — Update food item (name, price, qty) |
| DELETE | `/api/food/:foodid` | Admin only — Delete food item |

### 🛒 Food Store & Cart (Owners only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/store/suggestions` | Get suggested food items based on the logged-in owner's cats' food preferences. Aggregates preferences across **all** of the owner's adopted cats. Returns food items with a flag indicating they are "suggested." |
| GET | `/api/cart` | Get current user's cart contents |
| POST | `/api/cart` | Add item to cart (body: `{ foodid, quantity }`) |
| PUT | `/api/cart/:cartid` | Update quantity of a cart item |
| DELETE | `/api/cart/:cartid` | Remove item from cart |
| POST | `/api/cart/checkout` | Process checkout — see Checkout Flow below |

### 🏡 Owner Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/my-cats` | Returns all adopted cats of the logged-in user, with food suggestions per cat and birthday info (derived from DOB) |

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

### Checkout Flow (Food Store)
1. User submits checkout from their cart.
2. Backend:
   - Validates all cart items: check `food.qty >= cart.quantity` for each item.
   - If any item has insufficient stock, return an error specifying which item(s).
   - If all valid:
     - Create a `Purchase` record with `total_amount` calculated from `SUM(quantity * unit_price)`.
     - Create `Purchase_Item` records for each line item.
     - **Decrement `food.qty`** for each purchased food item by the purchased quantity.
     - Clear the user's cart.
     - Return the purchase confirmation with order details.
   - Use a **database transaction** — either everything succeeds or nothing does.

### Birthday Computation
- The `/api/dashboard/my-cats` endpoint should include each cat's DOB and a computed `next_birthday` or `days_until_birthday` field so the frontend can show birthday notices.

### Suggested Products Logic
- The `/api/store/suggestions` endpoint gathers all `Cat_Food_Preference` records for cats owned by the logged-in user.
- Returns a deduplicated list of food items, each marked as `suggested: true`.
- If the owner has no cats or no preferences are set, return an empty suggestions list.

### Owner Check
- A user is considered a **Cat Owner** if they have at least one adoption with status `Completed` or `Approved`
- The `/api/dashboard/my-cats` route should verify this — if no qualifying adoptions, return a `403` or a message
- The Food Store routes should also require owner status

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
| `ownerMiddleware` | Checks if the user has at least one qualifying adoption |

---

## Database Interaction Notes
- Use parameterized queries (never raw string interpolation — even for an academic project, this is good habit)
- The database schema, triggers, and views are defined separately in the **Database Prompt**
- The backend should trust that triggers (e.g., auto-updating cat availability) are handled at the DB level — no need to duplicate that logic in code
- Use transactions where multiple DB operations must succeed together (e.g., creating adoption + updating cat availability, checkout + inventory update)

Example transaction scenario (checkout):
```
BEGIN;
  INSERT INTO Purchase (userid, total_amount) VALUES (?, ?);
  SET @purchaseid = LAST_INSERT_ID();
  INSERT INTO Purchase_Item (purchaseid, foodid, quantity, unit_price) VALUES (?, ?, ?, ?);
  -- repeat for each item
  UPDATE Food SET qty = qty - ? WHERE foodid = ? AND qty >= ?;
  DELETE FROM Cart WHERE userid = ?;
COMMIT;
```
> Note: A DB trigger may handle inventory decrement automatically — check the database prompt to avoid double-updating.

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
- `400` — Bad request (invalid input, insufficient stock)
- `401` — Unauthorized (not logged in)
- `403` — Forbidden (not admin/owner)
- `404` — Not found
- `409` — Conflict (e.g., duplicate `shelter_name`)
- `500` — Server error

---

## Validation Rules
| Field | Rule |
|-------|------|
| `shelter_name` | Required, unique — return `409` if duplicate |
| `dob` | Required, must be a valid date in the past |
| `email` | Required, unique, valid format |
| `cart quantity` | Must be ≥ 1 and ≤ available stock |

---

## What to Keep Simple (Academic Project)
- No email verification or password reset flows needed
- No rate limiting or advanced security needed
- No caching (Redis, etc.) needed
- No real payment processing — checkout just decrements inventory
- Static food suggestions are okay if the relationship data isn't fully set up yet
- You don't need to write tests, but keep functions small and readable

---

## Notes for the Team
- Either student (Shlok or Sam) might be writing backend code in different sessions — always ask what routes/files already exist before creating new ones to avoid conflicts
- If a new feature is requested, add a new route — don't modify existing ones unless asked
- Comment your code — your professor will read it
