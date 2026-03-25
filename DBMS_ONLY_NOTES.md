# DBMS-Only Notes For Meowtopia

## 1. Core DBMS Concepts Used

1. Relational model with 3 main entities: `User`, `Cat`, `Adoption`.
2. Primary keys on each table.
3. Foreign keys in `Adoption` referencing `User` and `Cat`.
4. Integrity constraints:
   - `UNIQUE(email)` in `User`
   - `UNIQUE(shelter_name)` in `Cat`
   - `UNIQUE(userid, catid)` in `Adoption`
   - `CHECK (dob < intake_date)` in `Cat`
5. Cascading rules:
   - `ON DELETE CASCADE`
   - `ON UPDATE CASCADE`
6. Triggers:
   - `before_adoption_insert`
   - `after_adoption_insert`
7. Views:
   - `AvailableCats`
   - `AllCatsWithAge`
   - `AdminAdoptionOverview`
8. Transaction usage for adoption flow (`BEGIN`, row lock via `FOR UPDATE`, `COMMIT/ROLLBACK`).

## 2. Constraint Details (Teacher-Focused)

### A) CHECK Constraint
- Rule: `dob < intake_date`
- Why: prevents impossible cat data.
- Implemented in schema definition and in upgrade script.

### B) Composite UNIQUE Constraint
- Rule: one `(userid, catid)` pair appears only once in `Adoption`.
- Why: same user cannot submit duplicate request for same cat.
- Backend catches duplicate key and returns a clean `409` message.

### C) ON UPDATE CASCADE
- Applied on both adoption foreign keys.
- Why: if parent PK is updated, child FK values stay consistent automatically.

## 3. Trigger Logic

### `before_adoption_insert`
- Checks if cat is available.
- Rejects insert using `SIGNAL` when unavailable.

### `after_adoption_insert`
- Marks cat unavailable after successful adoption insert.
- Updates cat name to adopted name if provided.

## 4. SQL Logging as DBMS Demonstration

The project includes SQL logging for learning/demo:
1. Captures SQL statement, execution time, row count, source, success/error.
2. Stores logs in JSONL file.
3. Admin page can filter logs by:
   - event type
   - query type
   - status
   - table
   - text search
4. Shows rendered SQL with bound values (not separate SQL + params).

## 5. Files To Show In Viva

### Database
- `database/schema.sql`
- `database/dbms_constraints_upgrade.sql`
- `database/queries.sql`

### Backend (DBMS handling)
- `backend/src/config/db.js`
- `backend/src/controllers/catsController.js`
- `backend/src/controllers/adoptionsController.js`
- `backend/src/controllers/logsController.js`
- `backend/src/utils/sqlLogger.js`

### Frontend (SQL log filtering demo)
- `frontend/pages/admin.html`
- `frontend/js/data.js`

## 6. One-Minute Viva Pitch

Meowtopia uses a relational schema with strong integrity controls. We enforce entity integrity with primary keys, referential integrity with foreign keys, and domain/business integrity using CHECK, UNIQUE, ENUM, and triggers. Adoption uses transactions and row-level locking to avoid race conditions. We also expose SQL logs in admin view with filtering and fully rendered queries to demonstrate real query execution behavior.
