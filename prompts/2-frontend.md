# Meowtopia Frontend Prompt

## Context
You are helping build the **frontend** of Meowtopia, a cat adoption web platform, as part of an academic project. The platform is **adoption-only** -- there is no food store, no shopping cart, no purchases. The frontend should be warm, playful, and cozy -- think soft pastel colors, rounded corners, cat-themed touches. It doesn't need to be overly complex, just clean and functional.

If you need clarification on overall system behavior, refer to the **Main System Prompt**. This prompt focuses only on what the frontend needs to do and look like.

---

## Design Vibe
- **Color palette:** Blue-grey tones -- slate blue (`#5b8ec7`), muted blue-grey (`#7a9ab8`), light blue-grey background (`#f0f5fa`), teal accents (`#5db8a7`). Soft, professional, calming aesthetic.
- **Typography:** The entire website uses **Playfair Display** (Google Fonts) as the single, consistent font family. This gives the site a refined, editorial feel. Fallbacks: Georgia, Times New Roman, serif.
- **UI style:** Rounded cards, soft shadows, cozy and welcoming -- not corporate or harsh
- **Cat-themed touches:** Paw print icons, subtle cat-ear elements, fun micro-copy
- **Tone of writing on the UI:** Light, fun, warm (e.g., "Meet your purrfect match")

---

## Pages & Components to Build

### 1. Home / Landing Page
- **Hero section with background video:** A full-bleed, autoplaying, muted, looping background video (similar to The French Workshop bakery website style). The video should cover the entire hero viewport with `object-fit: cover`, have a poster/fallback image, and use `autoplay muted loop playsinline` attributes. **Use fast transitions with a subtle motion-blur feel between clips** (not slow fade-only). Overlay remains semi-transparent (8-10% opacity) with a subtle blue-purple gradient to keep videos visible and vibrant. Overlay text with the tagline (e.g., "Find your purrfect companion at Meowtopia") and a CTA button. The "Meowtopia" heading and "Where every whisker finds a home" tagline animate on page load with staggered letter-by-letter entrance animations for visual impact.
- **"Our Story" section:** Use a cat image as the section background with readable text overlay. Keep a **small vertical gap** between hero and this section, and keep the image slightly more visible (lighter overlay than before).
- A featured/random selection of cats available for adoption (cards)
- Call to action: Browse Cats, Sign Up
- **"Reset Data" button** at the bottom of the page -- clears all `localStorage` mock data and reinitializes defaults. This is for development convenience while using the static frontend. Keep it **isolated and easy to remove** when the real backend is connected (e.g., wrap in a clearly-marked section/function). Style it subtly -- small, muted color, not prominent.
- **Footer:** Keep it simple -- brand name and a short tagline. Do **NOT** include any text like "Made with ... as a DBMS Academic Project" or any other credit line that reveals the project is AI-generated or academic.

### 2. Cat Listings Page (Browse Cats)
- **View mode switcher (top-right):** Add a "View As" button with a changing icon and 3 options:
  - **Slide** (default) -- shows one cat card at a time with swipe gestures and hover-revealed side arrows
  - **Tiles** -- current grid card view
  - **List** -- horizontal list-style cards
- Grid of cat cards. **Card design:**
  - **Title:** The cat's `shelter_name` (admin-assigned temporary name) -- this is the primary label on each card. Do NOT show "Unnamed Kitty" -- almost all cats are unnamed initially, so it's redundant.
  - **Photo** of the cat. All cat images must have a **fixed aspect ratio** (4:3) -- the image area has a fixed height via `padding-top:75%` so that different image dimensions never distort the card layout.
  - **Image placeholder with fur-color gradient:** If a cat has no photo (or the photo fails to load), display a gradient-colored placeholder based on the cat's `fur_color`. A `furColorGradient(furColor)` utility function maps fur-color strings to CSS gradient values (e.g., "White" -> light gray gradient, "Orange" -> warm orange gradient, etc.). The placeholder shows a cat emoji and the breed name overlaid on the gradient. This also applies when admins add new cats without photos. **Important:** The image error handler must NOT replace the parent element's innerHTML (which would break the detail page layout). Instead, use `onerror` to hide the `<img>` and show a sibling placeholder `<div>` that's hidden by default.
  - **Key attributes** displayed in a clean, readable layout (NOT bubble/pill tags). Use a subtle, integrated design -- e.g., small icon + text pairs, a mini info grid, or delicate typography-based layout. Avoid flashy colored bubbles for attributes.
  - Attributes to show on card: breed, gender, age (derived from DOB, displayed in months), cattitude
  - Health status should NOT be prominently displayed on every card -- save it for the detail page.
  - Each card has a "Meet Me" button leading to the cat's detail page.

- **Filter button** that opens a **smart sidebar** (slide-in from the left, popup-style -- hidden by default, not persistent). Filter options:
  - **Gender:** Always visible (not collapsible). Single-select toggle. Clicking one option selects it; clicking the other switches; clicking the already-selected one deselects (clears the gender filter). Think toggle buttons, not radio buttons -- the user must be able to clear the selection. **Male button turns blue when active; Female button turns pink when active** (using `data-val` attribute-based CSS selectors).
  - **Age:** Always visible (not collapsible). **Dual-handle range slider** -- two `<input type="range">` overlaid on a single track, with a colored fill between the two handles. Displays the current min/max values below. Range: 0-240 months. Labels auto-format to months or years.
  - **Fur Color:** Multi-select (toggleable chips). User can pick multiple. **Collapsible accordion** -- header with chevron icon (decent sized, not tiny), body hidden by default. Click header to expand/collapse. **When a fur-color chip is active, its background uses the fur-color gradient** (from `furColorGradient()`) for a visual color preview. **Text color in active chips is adaptive:** if the gradient background is light, text is black; if dark, text is white. This prevents white text from becoming invisible on light-colored backgrounds like "White" or "Cream".
  - **Breed:** Multi-select. Collapsible accordion.
  - **Cattitude:** Multi-select. Collapsible accordion.
  - **Health Status:** Single-select toggle (same behavior as gender). Collapsible accordion. Maps "Healthy" filter to `Healthy` + `Vaccinated` statuses; "Needs Care" filter to `Under Treatment` status.
  - A "Clear All Filters" button within the sidebar header.
  - A close button to dismiss the sidebar.
  - An overlay behind the sidebar that also closes it when clicked.

- **Sort-by dropdown** (outside the sidebar, always visible). Meaningful sort options:
  - Sort by Age (youngest first / oldest first)
  - Sort by Date Added (newest first / oldest first)
  - Sort by Gender
  - Sort by Breed (A to Z / Z to A)
  - Sort by Vaccination Status
  - Sort by Adoption Status (available first)
- **No** heading text like "Browse Our Cats" or result count like "Showing X adorable cats" -- keep the UI clean and elegant.

### 3. Cat Detail Page
- Full photo of the cat
- All details: **shelter_name** (as heading), breed, **age (derived from DOB, shown in a readable format like "7 months" or "2 years, 3 months")**, gender, fur color (with adaptive text color based on background brightness), cattitude, health status, intake date
  - **Fur color attribute:** Displays with the fur-color gradient as background. Text color is automatically determined: if the background is light (brightness > 128), text is black; if dark, text is white. This ensures readability regardless of fur color.
- "Adopt Me" button (only visible to logged-in users; guests see "Login to Adopt")

### 4. Adoption Form Page (Logged-in users only)
Fields:
- User's name, phone, address (pre-filled if available)
- Name they want to give the cat (this becomes the cat's permanent name). **This field is optional** -- if left blank, the shelter name is used as the cat's name. Placeholder text should indicate this (e.g., "Leave blank to keep '[shelter_name]'").
- Pickup method: `Store Pickup` or `Home Delivery` shown as **clickable option boxes/buttons** (not tiny radio dots)
- Submit button: "Complete Adoption"

After submission -- show a **cute popup/modal** with a congratulatory message (e.g., "Congratulations! [cat name] is officially yours!"). After closing the popup, redirect to the cats page or home page.

### 5. Login / Register Pages
- Simple, clean forms
- Login has email + password
- Register has: name, email, password, phone
- Show validation errors inline
- After login, redirect to the exact page the user came from (especially adopt flow), else fallback to role-based default/home

### 6. Admin Panel (Admin users only)
- Separate login route or role-based redirect after login
- Tabs/Pages:
  - **Cat Management:** Table/list of all cats; Add, Edit, Delete buttons
  - **Add Cat Form:** All cat attributes including:
    - `shelter_name` -- **required, unique** (show validation if duplicate)
    - `dob` -- **required** (date picker, NOT a text age field)
    - `intake_date` -- **auto-filled with today's date** if left blank, allowing admins to skip this field for efficiency
    - Photo upload (file input)
    - **Cattitude dropdown:** Displays all existing cattitude values from cats in the database, allowing admin to select from existing personalities. If admin wants to add a new one, a button toggles to a text input field. New cattitude values are automatically capitalized (e.g., "playFul" becomes "Playful").
    - All other attributes (breed, fur_color, gender, health_status, etc.)
  - **Adoption Requests:** Table of all adoptions with status (Pending / Approved / Completed)

---

## Frontend-Backend Communication
- The frontend communicates with the backend via **REST API calls** (fetch or axios)
- All dynamic data (cats, user info, adoptions) comes from the backend
- Use loading states while data fetches
- Handle API errors gracefully with friendly messages (e.g., "Oops! Something went wrong. Try again?")

> **Static Frontend Phase:** While the backend isn't built yet, ALL data is simulated using `localStorage` via a mock data layer (`data.js`). This mock layer exposes the same function signatures as future API calls, making the switch to real API calls straightforward.

---

## Auth / Session Handling
- After login, store a token or session indicator (localStorage token or cookie)
- Use this to:
  - Show/hide "Adopt Me" buttons
  - Protect Admin Panel routes
  - Pre-fill form fields
- If a user tries to access the admin page without admin role, show an appropriate message

---

## Component Suggestions (Plain HTML/CSS/JS)
| Component / File | Purpose |
|-----------|---------|
| Cat Card | Reusable card for listings -- shelter_name as title, clean attribute layout |
| Adoption Form | The adoption form with popup logic |
| Adoption Popup | Cute modal after adoption |
| Admin Table | Reusable table for admin views |
| Navbar | Navigation with auth-aware links |
| Filter Sidebar | Smart slide-in sidebar with toggles, multi-select, and range slider |

---

## Things to Keep Simple (Academic Project)
- No real image hosting needed -- use a local `/public/images/` folder or placeholder images
- No complex animations -- subtle transitions are fine
- No real-time features (no websockets)
- Mobile responsiveness is a bonus, not a requirement -- desktop-first is fine
- The hero video can use a free stock cat video or a placeholder
- No food store, no shopping cart, no purchases -- adoption-only

---

## Notes for the Team
- Either of you (Shlok or Sam) might be working on this -- so always ask "what's already built?" before generating full new components
- If a feature isn't in this prompt but makes sense, it can be added -- this is a living document
- Keep files organized (e.g., `/css`, `/js`, `/pages`)
- The Reset Data button on the home page is for dev convenience only -- remove it (and the entire localStorage mock layer) when the real backend is connected
