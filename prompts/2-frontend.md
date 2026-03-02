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
- **Hero section with background video:** A full-bleed, autoplaying, muted, looping background video (similar to The French Workshop bakery website style). The video should cover the entire hero viewport with `object-fit: cover`, have a poster/fallback image, and use `autoplay muted loop playsinline` attributes. Overlay text with the tagline (e.g., _"Find your purrfect companion at Meowtopia"_) and a CTA button.
- A featured/random selection of cats available for adoption (cards)
- Call to action: Browse Cats, Sign Up
- **"Reset Data" button** at the bottom of the page — clears all `localStorage` mock data and reinitializes defaults. This is for development convenience while using the static frontend. Keep it **isolated and easy to remove** when the real backend is connected (e.g., wrap in a clearly-marked section/function). Style it subtly — small, muted color, not prominent.
- **Footer:** Keep it simple — brand name and a short tagline. Do **NOT** include any text like "Made with ❤️ as a DBMS Academic Project" or any other credit line that reveals the project is AI-generated or academic.

### 2. 🐾 Cat Listings Page (Browse Cats)
- Grid of cat cards. **Card design:**
  - **Title:** The cat's `shelter_name` (admin-assigned temporary name) — this is the primary label on each card. Do NOT show "Unnamed Kitty" — almost all cats are unnamed initially, so it's redundant.
  - **Photo** of the cat. All cat images must have a **fixed aspect ratio** (4:3) — the image area has a fixed height via `padding-top:75%` so that different image dimensions never distort the card layout.
  - **Image placeholder with fur-color gradient:** If a cat has no photo (or the photo fails to load), display a gradient-colored placeholder based on the cat's `fur_color`. A `furColorGradient(furColor)` utility function maps fur-color strings to CSS gradient values (e.g., "White" → light gray gradient, "Orange" → warm orange gradient, etc.). The placeholder shows a 🐱 emoji and the breed name overlaid on the gradient. This also applies when admins add new cats without photos. **Important:** The image error handler must NOT replace the parent element's innerHTML (which would break the detail page layout). Instead, use `onerror` to hide the `<img>` and show a sibling placeholder `<div>` that's hidden by default.
  - **Key attributes** displayed in a clean, readable layout (NOT bubble/pill tags). Use a subtle, integrated design — e.g., small icon + text pairs, a mini info grid, or delicate typography-based layout. Avoid flashy colored bubbles for attributes.
  - Attributes to show on card: breed, gender, age (derived from DOB, displayed in months), cattitude
  - Health status should NOT be prominently displayed on every card — save it for the detail page.
  - Each card has a "Meet Me →" button leading to the cat's detail page.

- **Filter button** that opens a **smart sidebar** (slide-in from the left, popup-style — hidden by default, not persistent). Filter options:
  - **Gender:** Always visible (not collapsible). Single-select toggle. Clicking one option selects it; clicking the other switches; clicking the already-selected one deselects (clears the gender filter). Think toggle buttons, not radio buttons — the user must be able to clear the selection. **Male button turns blue when active; Female button turns pink when active** (using `data-val` attribute-based CSS selectors).
  - **Age:** Always visible (not collapsible). **Dual-handle range slider** — two `<input type="range">` overlaid on a single track, with a colored fill between the two handles. Displays the current min/max values below. Range: 0–240 months. Labels auto-format to months or years.
  - **Fur Color:** Multi-select (toggleable chips). User can pick multiple. **Collapsible accordion** — header with ▸/▾ chevron icon (decent sized, not tiny), body hidden by default. Click header to expand/collapse. **When a fur-color chip is active, its background uses the fur-color gradient** (from `furColorGradient()`) for a visual color preview.
  - **Breed:** Multi-select. Collapsible accordion.
  - **Cattitude:** Multi-select. Collapsible accordion.
  - **Health Status:** Single-select toggle (same behavior as gender). Collapsible accordion. Maps "Healthy" filter to `Healthy` + `Vaccinated` statuses; "Needs Care" filter to `Under Treatment` status.
  - A "Clear All Filters" button within the sidebar header.
  - A ✕ close button to dismiss the sidebar.
  - An overlay behind the sidebar that also closes it when clicked.

- **Sort-by dropdown** (outside the sidebar, always visible). Options like: Newest, Oldest, Name A–Z, Name Z–A, Youngest First, Oldest First.

### 3. 🐱 Cat Detail Page
- Full photo of the cat
- All details: **shelter_name** (as heading), breed, **age (derived from DOB, shown in a readable format like "7 months" or "2 years, 3 months")**, gender, fur color, cattitude, health status, intake date
- "Adopt Me" button (only visible to logged-in users; guests see "Login to Adopt")

### 4. 📝 Adoption Form Page (Logged-in users only)
Fields:
- User's name, phone, address (pre-filled if available)
- Name they want to give the cat (this becomes the cat's permanent name). **This field is optional** — if left blank, the shelter name is used as the cat's name. Placeholder text should indicate this (e.g., "Leave blank to keep '[shelter_name]'").
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
  - "🎂 [Cat name]'s birthday is coming up on [date]!" — **derived from DOB**
  - These can be hardcoded/static for now if the backend isn't ready

### 7. 🛒 Food Store Page (Owners only)
A dedicated page for cat owners to purchase food. Layout (top to bottom):

#### Suggested Products Bar (Top Section)
- Displays food items that match the food preferences of the owner's adopted cats. If the owner has multiple cats, aggregate all their preferences.
- **Visual treatment:** This section must look special — use sparkle effects, four-point star decorations, a subtle glow, or shimmering animations. The heading should display **cat names** (using the cat's given name after adoption, falling back to shelter_name): if the owner has 1–3 adopted cats, show their names (e.g., _"Recommended for Snowball, Whiskers & Mittens ✨"_). If more than 3, use _"Recommended for your cats ✨"_. The goal: the UI should make the user feel like these are smart, personalized recommendations — **without** ever explicitly saying "AI" anywhere.
- **Carousel layout:** Suggested products are displayed as **horizontal cards** in an auto-scrolling carousel (slideshow style, like the review section from The French Workshop reference). One card visible at a time, slides left-to-right automatically every 4 seconds, with navigation dots below. Each card shows: food image, name, price, stock, and Add to Cart button side-by-side.
- If the owner has no food preferences set for their cats, this section simply doesn't appear.

#### All Products Grid
- Standard e-commerce-style product cards: **food image** (with emoji fallback on error), food name, price, stock left. The grid should be **responsive** — distribute columns based on screen width (e.g., 4–5 columns on wide screens via `repeat(auto-fill, minmax(180px, 1fr))`).
- Food items in mock data include `image_url` and `emoji` fields. If the image fails to load, fall back to the emoji.
- Each card has an **"Add to Cart"** button with a quantity selector (or defaults to 1).
- If an item is out of stock (`qty === 0`), show it as disabled/unavailable.

#### Cart (Sidebar or Flyout)
- Shows all added items, quantity per item, subtotal per item, and grand total.
- Allow quantity adjustments and item removal within the cart.
- **"Checkout"** button at bottom of cart.

#### Checkout Flow
- Simple confirmation step — show order summary, total amount.
- On confirm: items are "purchased" — inventory (`food.qty`) is decremented accordingly.
- Show a success message (e.g., _"Your order is confirmed! Your fur babies will love it 🐾"_).
- No real payment processing — this is academic.

### 8. 🛠️ Admin Panel (Admin users only)
- Separate login route or role-based redirect after login
- Pages:
  - **Cat Management:** Table/list of all cats; Add, Edit, Delete buttons
  - **Add Cat Form:** All cat attributes including:
    - `shelter_name` — **required, unique** (show validation if duplicate)
    - `dob` — **required** (date picker, NOT a text age field)
    - Photo upload (file input)
    - All other attributes (breed, fur_color, gender, health_status, cattitude, etc.)
  - **Adoption Requests:** Table of all adoptions with status (Pending / Approved / Completed)
  - **Food Management:** Table of food items; Add/Edit/Delete; inventory quantity management

---

## Frontend-Backend Communication
- The frontend communicates with the backend via **REST API calls** (fetch or axios)
- All dynamic data (cats, user info, adoptions, food store, cart) comes from the backend
- Use loading states while data fetches
- Handle API errors gracefully with friendly messages (e.g., "Oops! Something went wrong. Try again?")

> **Static Frontend Phase:** While the backend isn't built yet, ALL data is simulated using `localStorage` via a mock data layer (`data.js`). This mock layer exposes the same function signatures as future API calls, making the switch to real API calls straightforward.

---

## Auth / Session Handling
- After login, store a token or session indicator (localStorage token or cookie)
- Use this to:
  - Show/hide "Adopt Me" buttons
  - Protect Owner Dashboard, Food Store, and Admin Panel routes
  - Pre-fill form fields
- If a non-owner tries to access the dashboard or food store, show a message like: _"You haven't adopted any cats yet! Browse our cats and find your match 🐾"_

---

## Component Suggestions (Plain HTML/CSS/JS)
| Component / File | Purpose |
|-----------|---------|
| Cat Card | Reusable card for listings — shelter_name as title, clean attribute layout |
| Adoption Form | The adoption form with popup logic |
| Adoption Popup | Cute modal after adoption |
| Owner Dashboard | Dashboard layout for owners |
| Cat Detail Modal | Clicked cat detail overlay in dashboard |
| Admin Table | Reusable table for admin views |
| Notice Card | Vet/birthday notice mini cards |
| Navbar | Navigation with auth-aware links |
| Filter Sidebar | Smart slide-in sidebar with toggles, multi-select, and range slider |
| Food Store | Product grid + suggested products bar |
| Cart Flyout | Shopping cart sidebar |
| Sparkle Effects | CSS/JS animations for the Suggested Products section |

---

## Things to Keep Simple (Academic Project)
- No real image hosting needed — use a local `/public/images/` folder or placeholder images
- No complex animations — subtle transitions are fine (exception: the Suggested Products sparkle effects are encouraged)
- No real-time features (no websockets)
- Static notices are okay for now (vet visits, birthdays can be hardcoded initially)
- Mobile responsiveness is a bonus, not a requirement — desktop-first is fine
- No real payment processing — food store checkout is simulated
- The hero video can use a free stock cat video or a placeholder

---

## Notes for the Team
- Either of you (Shlok or Sam) might be working on this — so always ask _"what's already built?"_ before generating full new components
- If a feature isn't in this prompt but makes sense, it can be added — this is a living document
- Keep files organized (e.g., `/css`, `/js`, `/pages`)
- The Reset Data button on the home page is for dev convenience only — remove it (and the entire localStorage mock layer) when the real backend is connected
