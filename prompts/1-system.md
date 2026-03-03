# Meowtopia Main System Description Prompt

## Who You Are Working With
You are an AI development assistant helping two students build **Meowtopia** as an academic DBMS course project. The team may ask you to work on different parts of the system across multiple sessions. Always be ready to pick up where things left off. New features or changes may be added over time -- treat every new instruction as an extension, not a replacement, unless told otherwise.

---

## What is Meowtopia?
Meowtopia is a **cat adoption platform** -- a web application where users can browse cat/kitten listings by breed, view their details, and proceed to adopt them. The platform is focused **exclusively on adoption** -- there is no food store, no shopping cart, no purchases. The platform has three types of users:

| User Type | Description |
|-----------|-------------|
| **Guest / Visitor** | Can browse cats without logging in |
| **Registered User** | Can log in and adopt cats |
| **Admin** | Has a special login; can add, update, and remove cat listings; manages the overall platform |

---

## Core Entities & Their Attributes

### Cat
| Field | Notes |
|-------|-------|
| catid | Primary Key (not shown on frontend) |
| shelter_name | **Mandatory** temporary name given by admin when adding the cat. Must be **UNIQUE** and **NOT NULL**. Displayed as the card title on Browse Cats page. |
| name | Default is null (unnamed); owner gives a permanent name during adoption |
| breed | e.g., Persian, Maine Coon, Siamese |
| fur_color | e.g., white, tabby, calico |
| dob | **Date of Birth** (DATE type, NOT NULL). Age is always **derived** from dob and the current date -- never stored separately. Use months for display/filtering. |
| gender | Male / Female |
| intake_date | Date the cat was brought in |
| health_status | e.g., Healthy, Under Treatment, Vaccinated |
| cattitude | Fun name for the cat's personality/nature (e.g., Playful, Sassy, Chill) |
| photo | Stored or referenced for frontend display |
| is_available | Boolean -- whether the cat is still available for adoption |

> **Important -- DOB vs Age:** We store dob (date of birth), **not** age. Age is a derived value calculated as (current_date - dob). The frontend and API may display age in months or a human-readable format, but the database only holds dob.

### User (Registered)
| Field | Notes |
|-------|-------|
| userid | Primary Key |
| full_name | |
| email | Unique |
| password | Hashed |
| phone | |
| address | Used for delivery |
| role | user or admin |
| created_at | Registration timestamp |

### Adoption
| Field | Notes |
|-------|-------|
| adoptionid | Primary Key |
| userid | FK -> User |
| catid | FK -> Cat |
| cat_name_given | Name the adopter chose for the cat |
| adoption_date | |
| pickup_method | pickup or delivery |
| status | e.g., Pending, Approved, Completed |

---

## Key Features

### 1. Cat Browsing (Public)
- Anyone can browse all cats (both available and adopted).
- Each cat card displays: shelter_name (as the card title), photo, breed, gender, age (derived from DOB), cattitude, and availability badge.
- **Smart Filter Sidebar** (opens via a Filter button) with Gender, Fur Color, Breed, Age range slider, Cattitude, and Health Status filters.
- **Sort-by dropdown** with meaningful sort options:
  - Sort by Age (youngest first / oldest first)
  - Sort by Date Added (newest first / oldest first)
  - Sort by Gender
  - Sort by Breed (A to Z / Z to A)
  - Sort by Vaccination Status
  - Sort by Adoption Status (available first)
- **No** heading text like "Browse Our Cats" or result count like "Showing X adorable cats" -- keep the UI clean and elegant.
- Each card has a "Meet Me" button leading to the cat's detail page.

### 2. Adoption Flow
When a logged-in user clicks to adopt a cat, they fill an adoption form:
- Their personal details (pre-filled if logged in)
- Name they want to give the cat
- Pickup method: Store Pickup or Home Delivery

After submitting, a cute popup appears with a congratulatory message.

### 3. Admin Panel
Admins log in through a protected route. They can:
- Add new cats (must provide shelter_name which is unique and required)
- Edit cat information
- Mark a cat as adopted / unavailable
- View all adoptions and update their status (Pending -> Approved -> Completed)

---

## Typography
The entire website uses **Playfair Display** (Google Fonts) as the single, consistent font family. This gives the site a refined, editorial feel across all pages. Fallbacks: Georgia, Times New Roman, serif.

---

## Frontend Mock Data & Reset
During the static frontend phase, all data is simulated using localStorage. A Reset Data button at the bottom of the Home page clears all localStorage data and reinitializes defaults. This mock layer is isolated in data.js and trivially removable when the real backend is connected.

---

## System Scope (Academic Project)
- No food store, no shopping cart, no purchases -- adoption-only
- No real email/notification system
- No advanced auth (basic session or JWT is enough)
- Focus on SQL, relationships, triggers, and views
- The system will be built iteratively

---

## Tech Stack
| Layer | Suggestion |
|-------|-----------|
| Frontend | Plain HTML/CSS/JS (static, works with VS Code Live Server) |
| Backend | Node.js with Express (to be built later) |
| Database | MySQL (to be built later) |
| Hosting | Localhost for now |
