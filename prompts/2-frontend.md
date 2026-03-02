# 🎨 Meowtopia — Frontend Prompt

## Context
You are helping build the **frontend** of Meowtopia, a cat adoption web platform, as part of an academic project. The frontend should be warm, playful, and cozy — think soft pastel colors, rounded corners, cat-themed touches. It doesn't need to be overly complex, just clean and functional.

If you need clarification on overall system behavior, refer to the **Main System Prompt**. This prompt focuses only on what the frontend needs to do and look like.

---

## Design Vibe
- **Color palette:** Soft pastels — creamy whites, warm beiges, dusty rose, soft lavender, mint
- **Typography:** Friendly and readable (e.g., Poppins, Nunito, or similar Google Fonts)
- **UI style:** Rounded cards, soft shadows, cozy and welcoming — not corporate or harsh
- **Cat-themed touches:** Paw print icons, subtle cat-ear elements, fun micro-copy
- **Tone of writing on the UI:** Light, fun, warm (e.g., "Meet your purrfect match 🐾")

---

## Pages & Components to Build

### 1. 🏠 Home / Landing Page
- Hero section with a tagline like _"Find your purrfect companion at Meowtopia"_
- A featured/random selection of cats available for adoption (cards)
- Call to action: Browse Cats, Sign Up

### 2. 🐾 Cat Listings Page
- Grid of cat cards showing: photo, name (or "Unnamed"), breed, age, gender, cattitude
- Filter/search options: breed, age range, gender, fur color
- Each card has a "Meet Me →" button leading to the cat's detail page

### 3. 🐱 Cat Detail Page
- Full photo of the cat
- All details: breed, age, gender, fur color, cattitude, health status, intake date
- "Adopt Me" button (only visible to logged-in users; guests see "Login to Adopt")

### 4. 📝 Adoption Form Page (Logged-in users only)
Fields:
- User's name, phone, address (pre-filled if available)
- Name they want to give the cat
- Pickup method: `Store Pickup` or `Home Delivery` (radio button or toggle)
- Submit button: "Complete Adoption 🐾"

After submission — show a **cute popup/modal**:
- If **Store Pickup:** _"Don't forget to bring [food preference] when you come to pick up [cat name]! We can't wait to see you 🐾"_
- If **Home Delivery:** _"[Cat name] is on the way! Prepare some [food preference] for their grand arrival 🏠🐱"_
- The food shown in the popup comes from the backend (cat's food preference data)

### 5. 🔐 Login / Register Pages
- Simple, clean forms
- Login has email + password
- Register has: name, email, password, phone
- Show validation errors inline
- After login, redirect to previous page or home

### 6. 🏡 Cat Owner Dashboard (Owners only)
This is a special page — cozy and personal. Only accessible to users who have adopted at least one cat.

Layout:
- Welcome message: _"Welcome back, [name]! Your babies miss you 🐱"_
- **My Cats section:** Cards for each owned cat with photo + given name + breed
- Clicking a cat card opens a **Cat Detail Modal or Sub-page** showing:
  - Full details of the cat
  - Food suggestions (e.g., _"[Cat name] loves Cat Milk and Tuna Bites — make sure to stock up!"_)
  - More/extra photos if available
- **Notices section:** Small card-based area showing things like:
  - "🩺 Vet visit reminder for [cat name] on [date]"
  - "🎂 [Cat name]'s birthday is coming up on [date]!"
  - These can be hardcoded/static for now if the backend isn't ready

### 7. 🛠️ Admin Panel (Admin users only)
- Separate login route or role-based redirect after login
- Pages:
  - **Cat Management:** Table/list of all cats; Add, Edit, Delete buttons
  - **Add Cat Form:** All cat attributes including photo upload (file input)
  - **Adoption Requests:** Table of all adoptions with status (Pending / Approved / Completed)
  - **Food Management:** Table of food items; Add/Edit/Delete

---

## Frontend-Backend Communication
- The frontend communicates with the backend via **REST API calls** (fetch or axios)
- All dynamic data (cats, user info, adoptions, food suggestions) comes from the backend
- Use loading states while data fetches
- Handle API errors gracefully with friendly messages (e.g., "Oops! Something went wrong. Try again?")

---

## Auth / Session Handling
- After login, store a token or session indicator (localStorage token or cookie)
- Use this to:
  - Show/hide "Adopt Me" buttons
  - Protect Owner Dashboard and Admin Panel routes
  - Pre-fill form fields
- If a non-owner tries to access the dashboard, show a message like: _"You haven't adopted any cats yet! Browse our cats and find your match 🐾"_

---

## Component Suggestions (if using React)
| Component | Purpose |
|-----------|---------|
| `CatCard` | Reusable card for listings |
| `AdoptionForm` | The adoption form with popup logic |
| `AdoptionPopup` | Cute modal after adoption |
| `OwnerDashboard` | Dashboard layout for owners |
| `CatDetailModal` | Clicked cat detail overlay in dashboard |
| `AdminTable` | Reusable table for admin views |
| `NoticeCard` | Vet/birthday notice mini cards |
| `Navbar` | Navigation with auth-aware links |

---

## Things to Keep Simple (Academic Project)
- No real image hosting needed — use a local `/public/images/` folder or placeholder images
- No complex animations — subtle transitions are fine
- No real-time features (no websockets)
- Static notices are okay for now (vet visits, birthdays can be hardcoded initially)
- Mobile responsiveness is a bonus, not a requirement — desktop-first is fine

---

## Notes for the Team
- Either of you (the student or Sam) might be working on this — so always ask _"what's already built?"_ before generating full new components
- If a feature isn't in this prompt but makes sense, it can be added — this is a living document
- Keep component files organized (e.g., `/components`, `/pages`, `/api`)
