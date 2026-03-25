# Meowtopia DBMS Project Explanation

## 1. Project Overview

### What this project does
Meowtopia is a cat adoption management system. It lets users register, log in, browse cats, view cat details, and submit adoption requests. Admins can manage cat records, review adoption requests, update adoption status, and inspect SQL logs.

### Main purpose
The main purpose of this project is to digitize the cat adoption workflow. Instead of managing records manually, the system stores users, cats, and adoption requests in a database and exposes them through a web application.

### Problem it solves
This project solves these common problems:
- manual record keeping for cats and adoptions
- difficulty searching and filtering available cats
- lack of centralized adoption status tracking
- no easy way to manage users, cats, and requests together

---

## 2. Tech Stack

### Frontend
- HTML for page structure
- CSS for styling and responsive layout
- JavaScript for client-side logic and API calls
- Static pages and reusable scripts in the `frontend` folder
- Font imports from Google Fonts for presentation

Main frontend files:
- [frontend/index.html](frontend/index.html)
- [frontend/js/app.js](frontend/js/app.js)
- [frontend/js/data.js](frontend/js/data.js)
- [frontend/css/style.css](frontend/css/style.css)

### Backend
- Node.js runtime
- Express.js server
- REST API design
- MySQL connectivity using `mysql2`
- JWT for authentication
- `bcrypt` for password hashing
- `multer` for cat photo uploads
- CORS for frontend-backend communication

Main backend files:
- [backend/src/server.js](backend/src/server.js)
- [backend/src/app.js](backend/src/app.js)
- [backend/src/config/db.js](backend/src/config/db.js)

### Database
- MySQL relational database
- Tables: `User`, `Cat`, `Adoption`
- Views: `AvailableCats`, `AllCatsWithAge`, `AdminAdoptionOverview`
- Triggers: `before_adoption_insert`, `after_adoption_insert`

Main SQL files:
- [database/schema.sql](database/schema.sql)
- [database/seed.sql](database/seed.sql)
- [database/queries.sql](database/queries.sql)

---

## 3. Folder and File Structure

### Root folder
- [package.json](package.json): workspace scripts to start frontend and backend together
- [README.md](README.md): short project overview
- [how-to-run.md](how-to-run.md): basic run instructions
- [PROJECT_EXPLANATION.md](PROJECT_EXPLANATION.md): this document

### `frontend/`
This folder contains the user interface.

Important files:
- [frontend/index.html](frontend/index.html): home page with hero section, story section, and adoption intro
- [frontend/pages/login.html](frontend/pages/login.html): login form
- [frontend/pages/register.html](frontend/pages/register.html): registration form
- [frontend/pages/cats.html](frontend/pages/cats.html): browse and filter cats
- [frontend/pages/cat-detail.html](frontend/pages/cat-detail.html): detailed view of one cat
- [frontend/pages/adopt.html](frontend/pages/adopt.html): adoption form
- [frontend/pages/dashboard.html](frontend/pages/dashboard.html): user adoption dashboard
- [frontend/pages/admin.html](frontend/pages/admin.html): admin panel for cat management, adoptions, and logs
- [frontend/pages/store.html](frontend/pages/store.html): legacy food-store UI placeholder
- [frontend/js/data.js](frontend/js/data.js): API wrapper and shared helper functions
- [frontend/js/app.js](frontend/js/app.js): shared UI rendering logic like navbar, footer, and cat cards
- [frontend/css/style.css](frontend/css/style.css): full design system and page styling

### `backend/`
This folder contains the server and API logic.

Important files:
- [backend/package.json](backend/package.json): backend dependencies and scripts
- [backend/src/server.js](backend/src/server.js): application entry point and database startup check
- [backend/src/app.js](backend/src/app.js): Express app setup, routes, middleware, and static file serving
- [backend/src/config/db.js](backend/src/config/db.js): MySQL connection pool and SQL logging wrapper
- [backend/src/routes/authRoutes.js](backend/src/routes/authRoutes.js): authentication routes
- [backend/src/routes/catsRoutes.js](backend/src/routes/catsRoutes.js): cat CRUD routes
- [backend/src/routes/adoptionsRoutes.js](backend/src/routes/adoptionsRoutes.js): adoption routes
- [backend/src/routes/logsRoutes.js](backend/src/routes/logsRoutes.js): SQL log routes
- [backend/src/controllers/authController.js](backend/src/controllers/authController.js): register, login, and current-user logic
- [backend/src/controllers/catsController.js](backend/src/controllers/catsController.js): cat search, detail, create, update, and delete
- [backend/src/controllers/adoptionsController.js](backend/src/controllers/adoptionsController.js): adoption creation and status management
- [backend/src/controllers/logsController.js](backend/src/controllers/logsController.js): SQL log read/delete operations
- [backend/src/middleware/authMiddleware.js](backend/src/middleware/authMiddleware.js): JWT verification and user loading
- [backend/src/middleware/adminMiddleware.js](backend/src/middleware/adminMiddleware.js): admin access check
- [backend/src/middleware/errorMiddleware.js](backend/src/middleware/errorMiddleware.js): global server error handler
- [backend/src/utils/apiResponse.js](backend/src/utils/apiResponse.js): standard success/failure response helpers
- [backend/src/utils/validators.js](backend/src/utils/validators.js): email and past-date validation
- [backend/src/utils/sqlLogger.js](backend/src/utils/sqlLogger.js): SQL query logging to a JSONL file

### `database/`
This folder contains the database scripts.

Important files:
- [database/schema.sql](database/schema.sql): database schema, constraints, views, and triggers
- [database/seed.sql](database/seed.sql): demo user seed data
- [database/queries.sql](database/queries.sql): sample SQL queries for testing and exam demonstration
- [database/logs/sql-query-log.jsonl](database/logs/sql-query-log.jsonl): generated SQL activity log file

---

## 4. How the System Works

### Step-by-step flow
1. The user opens the frontend in the browser.
2. JavaScript in [frontend/js/data.js](frontend/js/data.js) sends a request to the backend API.
3. The backend receives the request through Express routes such as `/api/auth`, `/api/cats`, and `/api/adoptions`.
4. The controller processes the request and runs SQL queries on MySQL.
5. The database returns the result.
6. The backend formats the result as JSON and sends it back.
7. The frontend receives the response and updates the page.

### Example flow for adoption
1. User logs in through the login page.
2. The token is stored in browser local storage.
3. User opens a cat detail page and clicks adopt.
4. Frontend sends `POST /api/adoptions` with the cat id, chosen cat name, and pickup method.
5. Backend checks authentication and availability.
6. Backend inserts a row into `Adoption` and updates the cat as unavailable.
7. User gets a success response and sees the confirmation modal.

---

## 5. Database Design

### Tables

#### `User`
Stores account details.

Attributes:
- `userid` as primary key
- `full_name`
- `email` with unique constraint
- `password`
- `phone`
- `address`
- `role` with values `user` or `admin`
- `created_at`

#### `Cat`
Stores cat records.

Attributes:
- `catid` as primary key
- `shelter_name` with unique constraint
- `name`
- `breed`
- `fur_color`
- `dob`
- `gender`
- `intake_date`
- `health_status`
- `cattitude`
- `photo_url`
- `photo_position`
- `is_available`

#### `Adoption`
Stores adoption requests.

Attributes:
- `adoptionid` as primary key
- `userid` as foreign key
- `catid` as foreign key
- `cat_name_given`
- `adoption_date`
- `pickup_method`
- `status`

### Relationships
- One user can create many adoption records.
- One cat can appear in one adoption record at a time in the current workflow.
- `Adoption.userid` references `User.userid`.
- `Adoption.catid` references `Cat.catid`.

### Primary keys and foreign keys
- Primary keys uniquely identify each row.
- Foreign keys link adoption records to users and cats.
- `ON DELETE CASCADE` is used so related adoption rows are removed if the parent user or cat is deleted.

### Views
- `AvailableCats` shows only available cats with computed age.
- `AllCatsWithAge` shows all cats with computed age.
- `AdminAdoptionOverview` joins adoption, user, and cat data for admin review.

### Triggers
- `before_adoption_insert` blocks adoption if the cat is already unavailable.
- `after_adoption_insert` marks the cat unavailable after adoption is inserted.

---

## 6. Important Features

- User registration and login
- JWT-based authentication
- Role-based access control for user and admin
- Browse cats with filtering and sorting
- View cat details with age and health information
- Submit adoption requests
- Prevent double adoption of the same cat
- Admin panel for cat CRUD operations
- Admin adoption approval/rejection/completion flow
- Photo upload for cat records
- SQL query logging for demonstration and debugging
- Responsive and styled frontend pages

---

## 7. API Endpoints

### Authentication
- `POST /api/auth/register` - create a new user account
- `POST /api/auth/login` - log in and get a JWT token
- `GET /api/auth/me` - get the current authenticated user

### Cats
- `GET /api/cats` - get all cats with filters and sorting
- `GET /api/cats/:catid` - get one cat by id
- `POST /api/cats` - add a cat, admin only
- `PUT /api/cats/:catid` - update a cat, admin only
- `DELETE /api/cats/:catid` - delete a cat, admin only

### Adoptions
- `POST /api/adoptions` - create an adoption request
- `GET /api/adoptions/my` - get the logged-in user's adoptions
- `GET /api/adoptions` - get all adoption records, admin only
- `PUT /api/adoptions/:id/status` - update adoption status, admin only

### SQL Logs
- `GET /api/logs/sql` - read SQL query logs, admin only
- `DELETE /api/logs/sql` - clear SQL query logs, admin only

### Health and root
- `GET /api/health` - health check
- `GET /` - API directory response
- `GET /api` - API status response

---

## 8. How to Run the Project

### Prerequisites
- Node.js
- MySQL server
- VS Code or another editor

### Database setup
1. Create the MySQL database.
2. Run [database/schema.sql](database/schema.sql).
3. Run [database/seed.sql](database/seed.sql).

### Backend setup
1. Go to the `backend` folder.
2. Install dependencies with `npm install`.
3. Create and update `backend/.env` with MySQL credentials and JWT secret.
4. Start the server with `npm run dev`.

### Frontend setup
1. Open the `frontend` folder.
2. Run Live Server or another static server.
3. Open the frontend on the port used by the backend CORS configuration.

### Root scripts
From the project root:
- `npm run dev:backend`
- `npm run dev:frontend`

### Default local URLs
- Frontend: `http://127.0.0.1:5500`
- Backend: `http://localhost:5000`

---

## 9. Possible Improvements

- Add search by cat name and shelter name on the browse page
- Add pagination for large cat lists
- Add better server-side validation for all form inputs
- Add an edit history table for cat updates
- Add adoption remarks or admin notes
- Add audit fields such as `updated_at` and `updated_by`
- Add a separate table for cat photos if multiple images are needed
- Add notifications for adoption status changes
- Add stronger password rules and account lockout after repeated failures

---

## DBMS Syllabus Mapping

This part focuses only on these chapters:
- SQL / Relational Model
- Database Constraints
- Normalization

### i. Concepts Already Used

#### SQL / Relational Model
- `SELECT` is used in many backend queries and sample queries in [database/queries.sql](database/queries.sql).
- `INSERT`, `UPDATE`, and `DELETE` are used in the backend controllers for users, cats, and adoptions.
- `JOIN` is used in adoption queries and the `AdminAdoptionOverview` view.
- `WHERE`, `ORDER BY`, `IN`, `BETWEEN`, and `FOR UPDATE` are used in cat filtering and adoption locking.
- Aggregate-style derived data is shown through `TIMESTAMPDIFF(MONTH, dob, CURDATE()) AS age_months`.
- Views are used to simplify repeated `SELECT` logic.

Where this appears:
- [backend/src/controllers/catsController.js](backend/src/controllers/catsController.js)
- [backend/src/controllers/adoptionsController.js](backend/src/controllers/adoptionsController.js)
- [database/schema.sql](database/schema.sql)
- [database/queries.sql](database/queries.sql)

#### Database Constraints
- `PRIMARY KEY` is used on all main tables.
- `UNIQUE` is used on `User.email` and `Cat.shelter_name`.
- Composite `UNIQUE (userid, catid)` is used in `Adoption` to block duplicate user-cat requests.
- `NOT NULL` is used on important required columns.
- `FOREIGN KEY` is used in `Adoption` to connect users and cats.
- `ENUM` is used for fixed-value columns like `role`, `gender`, `pickup_method`, and `status`.
- `DEFAULT` is used for fields such as `created_at`, `is_available`, and `status`.
- `ON DELETE CASCADE` is used to preserve referential integrity.
- `ON UPDATE CASCADE` is used on `Adoption` foreign keys.
- `CHECK (dob < intake_date)` is used in `Cat` for date validity.
- Triggers enforce a business rule that a cat cannot be adopted twice.

Where this appears:
- [database/schema.sql](database/schema.sql)
- [backend/src/controllers/authController.js](backend/src/controllers/authController.js)
- [backend/src/controllers/catsController.js](backend/src/controllers/catsController.js)
- [backend/src/controllers/adoptionsController.js](backend/src/controllers/adoptionsController.js)

#### Normalization
- The project uses separate tables for users, cats, and adoptions.
- Adoption data is stored in a separate table instead of repeating user or cat data everywhere.
- Repeated data is reduced by using foreign keys and joins.
- Cat details are not duplicated inside the user table.
- User details are not duplicated inside the cat table.

This is a good example of a simple normalized design for a student-level project.

### ii. Concepts Missing

These syllabus concepts are not clearly implemented in the project:
- `ASSERTION`
- `VIEW WITH CHECK OPTION`
- Stored procedures
- Database functions
- Advanced transaction isolation examples
- Advanced normalization discussion such as detailed dependency analysis
- Decomposition examples for 1NF, 2NF, and 3NF
- BCNF and higher normal forms
- Materialized views
- Complex query optimization topics
- Index design for performance tuning as a taught feature

### iii. Concepts Recently Implemented (March 2026)

#### 1. Added `CHECK (dob < intake_date)` on `Cat`
- Implemented in [database/schema.sql](database/schema.sql).
- Upgrade script added in [database/dbms_constraints_upgrade.sql](database/dbms_constraints_upgrade.sql).
- Backend mirror-validation added in [backend/src/controllers/catsController.js](backend/src/controllers/catsController.js).

#### 2. Added composite `UNIQUE (userid, catid)` on `Adoption`
- Implemented in [database/schema.sql](database/schema.sql).
- Upgrade script added in [database/dbms_constraints_upgrade.sql](database/dbms_constraints_upgrade.sql).
- Duplicate-key handling added in [backend/src/controllers/adoptionsController.js](backend/src/controllers/adoptionsController.js).

#### 3. Added `ON UPDATE CASCADE` on adoption foreign keys
- Implemented in [database/schema.sql](database/schema.sql).
- Upgrade script added in [database/dbms_constraints_upgrade.sql](database/dbms_constraints_upgrade.sql).

#### 4. Improved SQL log readability + filtering for admin
- Filter parsing added in [backend/src/controllers/logsController.js](backend/src/controllers/logsController.js).
- Rendered SQL (query with bound values) and event tagging added in [backend/src/utils/sqlLogger.js](backend/src/utils/sqlLogger.js).
- Admin UI filters and rendered SQL display added in [frontend/pages/admin.html](frontend/pages/admin.html).
- Filter-ready API client helper added in [frontend/js/data.js](frontend/js/data.js).

### iv. Can Be Added Easily

#### 1. Add a `CHECK` constraint for adoption status logic
- What to add: limit adoption status transitions or at least enforce allowed status values at the database level.
- Concept it demonstrates: constraints and business rules.
- How to implement: keep the existing `ENUM` and add a trigger or validation rule that rejects invalid updates.

#### 2. Add a separate `CatPhoto` table
- What to add: store multiple photos per cat.
- Concept it demonstrates: normalization and removal of repeating groups.
- How to implement: create `CatPhoto(photoid, catid, photo_url, is_primary)` and move photo data out of `Cat`.

#### 3. Add an `AuditLog` table
- What to add: record important actions such as create, update, delete, approve, and reject.
- Concept it demonstrates: relational design, constraints, and logging.
- How to implement: insert one row into `AuditLog` from backend controllers whenever an important action happens.

#### 4. Add a `CHECK` for phone number length
- What to add: restrict phone numbers to a reasonable length.
- Concept it demonstrates: domain constraint.
- How to implement: use a `CHECK (CHAR_LENGTH(phone) BETWEEN 10 AND 15)` rule.

#### 5. Add stored procedures for admin actions
- What to add: procedures like `ApproveAdoption` or `RejectAdoption`.
- Concept it demonstrates: SQL stored procedures.
- How to implement: move the status update and cat availability update into a stored procedure and call it from the backend.

#### 6. Add sample normalization notes in the report
- What to add: show how unnormalized data would look and how it was split into tables.
- Concept it demonstrates: 1NF, 2NF, 3NF.
- How to implement: prepare a short theory note or diagram for exam presentation, using the current schema as the normalized version.

### v. Not Necessary or Advanced

These are not essential for this project and may be too advanced for a student-level DBMS demo:
- query optimizer internals
- execution plan tuning
- indexing strategy comparisons in depth
- partitioning and sharding
- replication and failover setup
- nested transactions
- distributed database concepts
- advanced deadlock handling
- complex stored procedure frameworks
- materialized view refresh strategies
- advanced functional dependency proofs for BCNF/4NF/5NF

---

## Comment Map For Viva Questions

This section tells exactly where explanatory comments were added in code.

- SQL log filter implementation and filter parsing comment: [backend/src/controllers/logsController.js](backend/src/controllers/logsController.js)
- Rendered SQL generation, event-tagging, and filter-matching comments: [backend/src/utils/sqlLogger.js](backend/src/utils/sqlLogger.js)
- Cat date-validation comment aligned with DB `CHECK` constraint: [backend/src/controllers/catsController.js](backend/src/controllers/catsController.js)
- Adoption duplicate handling comment aligned with composite `UNIQUE`: [backend/src/controllers/adoptionsController.js](backend/src/controllers/adoptionsController.js)
- Admin logs UI comment for server-side filters and rendered SQL usage: [frontend/pages/admin.html](frontend/pages/admin.html)
- DBMS constraints comments (CHECK, UNIQUE, FK cascade): [database/schema.sql](database/schema.sql)
- Full MySQL upgrade script comments section-by-section: [database/dbms_constraints_upgrade.sql](database/dbms_constraints_upgrade.sql)

---

## Short Exam Summary

Meowtopia is a web-based cat adoption system built with HTML, CSS, JavaScript, Node.js, Express, and MySQL. It supports user authentication, cat browsing, adoption requests, and admin management. From a DBMS point of view, it already demonstrates relational tables, primary keys, foreign keys, uniqueness, defaults, joins, views, triggers, and transactions. It is a good student-level example of SQL, the relational model, constraints, and basic normalization.
