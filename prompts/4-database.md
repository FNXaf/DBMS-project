# Meowtopia Database Prompt

## Context
You are helping design and implement the **database layer** of Meowtopia, a cat adoption platform built as an academic DBMS project. The platform is **adoption-only** -- there is no food store, no shopping cart, no purchases. This database should reflect what is actually studied in the course -- ER modeling, SQL (DDL + DML), normalization, views, and triggers. Keep it practical and aligned with academic expectations.

For full system context, refer to the **Main System Prompt**. This prompt focuses specifically on the database design and SQL implementation.

---

## DBMS Concepts Covered (From Course -- Applied Here)
| Course Topic | Applied As |
|-------------|-----------|
| ER Model & ER Diagram | Entity-relationship design for all tables |
| Entities, Attributes, Keys | All tables with PKs, FKs, and attributes |
| Strong & Weak Entity Sets | e.g., Adoption is a relationship-turned-entity between User and Cat |
| Relational Model & SQL | All DDL and DML queries |
| Views | Useful views for admin, cat browsing, and age computation |
| Triggers | Auto-update cat availability on adoption |
| Functional Dependencies & Normalization | Tables designed to 3NF |
| Integrity & Domain Constraints | NOT NULL, UNIQUE, CHECK, FK constraints |
| Assertions / Triggers | Use triggers as practical alternative to assertions |

> Skip: Crash recovery, concurrency control, B+ trees, hashing, distributed/OO databases -- not needed for this project.

---

## ER Diagram (Conceptual -- Describe to Your AI Agent)

**Entities:**
- `User` (strong entity)
- `Cat` (strong entity)
- `Adoption` (can be modeled as a relationship-turned-entity between User and Cat)

**Relationships:**
- `User` **makes** `Adoption` -- one user can make many adoptions
- `Adoption` **involves** `Cat` -- each adoption is for one cat

---

## DDL -- Table Definitions

```sql
-- Users table
CREATE TABLE User (
    userid      INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,  -- store hashed password
    phone       VARCHAR(20),
    address     TEXT,
    role        ENUM('user', 'admin') DEFAULT 'user',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cat table
CREATE TABLE Cat (
    catid           INT AUTO_INCREMENT PRIMARY KEY,
    shelter_name    VARCHAR(100) NOT NULL UNIQUE,  -- temporary name given by admin, displayed as card title
    name            VARCHAR(100) DEFAULT NULL,      -- null until adoption; owner gives permanent name
    breed           VARCHAR(100) NOT NULL,
    fur_color       VARCHAR(50),
    dob             DATE NOT NULL,                  -- Date of Birth -- age is DERIVED, never stored
    gender          ENUM('Male', 'Female') NOT NULL,
    intake_date     DATE NOT NULL,
    health_status   VARCHAR(100) DEFAULT 'Healthy',
    cattitude       VARCHAR(100),                   -- personality trait, fun field
    photo_url       VARCHAR(255),
    photo_position  VARCHAR(10) DEFAULT 'center',  -- CSS object-position for photo crop (center/top/bottom)
    is_available    BOOLEAN DEFAULT TRUE
);
-- NOTE: Age is computed as TIMESTAMPDIFF(MONTH, dob, CURDATE()) wherever needed.
-- Never store age as a column -- always derive it from dob.

-- Adoption table (relationship entity between User and Cat)
CREATE TABLE Adoption (
    adoptionid      INT AUTO_INCREMENT PRIMARY KEY,
    userid          INT NOT NULL,
    catid           INT NOT NULL,
    cat_name_given  VARCHAR(100),  -- permanent name chosen by adopter
    adoption_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_method   ENUM('pickup', 'delivery') NOT NULL,
    status          ENUM('Pending', 'Approved', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (userid) REFERENCES User(userid) ON DELETE CASCADE,
    FOREIGN KEY (catid) REFERENCES Cat(catid) ON DELETE CASCADE
);
```

---

## Normalization Notes (For Your Report/Viva)

All tables are designed to **3NF (Third Normal Form)**:

- **1NF:** All attributes are atomic (no multi-valued fields)
- **2NF:** No partial dependencies (all non-key attributes fully depend on the whole primary key)
- **3NF:** No transitive dependencies

**Derived attribute:** `age` is NOT stored -- it is computed from `dob` using `TIMESTAMPDIFF(MONTH, dob, CURDATE())`. This avoids data staleness and is a good example of a derived attribute (relevant in ER modeling theory).

---

## Triggers

### Trigger 1: Auto-mark Cat as Unavailable After Adoption

```sql
DELIMITER $$

CREATE TRIGGER after_adoption_insert
AFTER INSERT ON Adoption
FOR EACH ROW
BEGIN
    UPDATE Cat
    SET is_available = FALSE
    WHERE catid = NEW.catid;
END$$

DELIMITER ;
```
> This ensures that when an adoption record is created, the cat is automatically marked as unavailable -- no need to handle this in application code separately.

### Trigger 2: Prevent Adopting an Unavailable Cat

```sql
DELIMITER $$

CREATE TRIGGER before_adoption_insert
BEFORE INSERT ON Adoption
FOR EACH ROW
BEGIN
    DECLARE cat_status BOOLEAN;
    SELECT is_available INTO cat_status FROM Cat WHERE catid = NEW.catid;
    IF cat_status = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This cat is no longer available for adoption.';
    END IF;
END$$

DELIMITER ;
```
> This prevents race conditions where two users try to adopt the same cat simultaneously.

---

## Views

### View 1: Available Cats with Age (for Browse Page)

```sql
CREATE VIEW AvailableCats AS
SELECT
    catid,
    shelter_name,
    breed,
    fur_color,
    dob,
    TIMESTAMPDIFF(MONTH, dob, CURDATE()) AS age_months,
    gender,
    cattitude,
    health_status,
    photo_url,
    is_available
FROM Cat
WHERE is_available = TRUE;
```
> Includes the computed `age_months` derived from `dob`. The browse page uses this view instead of querying Cat directly.

### View 2: All Cats with Age (for Admin and Sort by Status)

```sql
CREATE VIEW AllCatsWithAge AS
SELECT
    catid,
    shelter_name,
    name,
    breed,
    fur_color,
    dob,
    TIMESTAMPDIFF(MONTH, dob, CURDATE()) AS age_months,
    gender,
    intake_date,
    cattitude,
    health_status,
    photo_url,
    photo_position,
    is_available
FROM Cat;
```
> Used when the frontend needs to display all cats (both available and adopted) with sorting by adoption status.

### View 3: Admin Adoption Overview

```sql
CREATE VIEW AdminAdoptionOverview AS
SELECT
    a.adoptionid,
    u.full_name AS adopter_name,
    u.email,
    a.cat_name_given,
    c.shelter_name,
    c.breed,
    a.pickup_method,
    a.status,
    a.adoption_date
FROM Adoption a
JOIN User u ON a.userid = u.userid
JOIN Cat c ON a.catid = c.catid;
```

---

## Sample DML Queries

### Insert a new cat (with shelter_name and dob)
```sql
INSERT INTO Cat (shelter_name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url)
VALUES ('Snowball', 'Persian', 'White', '2024-07-15', 'Female', '2025-01-15', 'Vaccinated', 'Chill', '/uploads/cats/persian_1.jpg');
```

### Get a cat's age in months (derived from dob)
```sql
SELECT shelter_name, breed, TIMESTAMPDIFF(MONTH, dob, CURDATE()) AS age_months
FROM Cat
WHERE catid = 1;
```

### Get all cats owned by a specific user
```sql
SELECT a.cat_name_given, c.shelter_name, c.breed, c.cattitude, c.photo_url,
       TIMESTAMPDIFF(MONTH, c.dob, CURDATE()) AS age_months
FROM Adoption a
JOIN Cat c ON a.catid = c.catid
WHERE a.userid = 3 AND a.status IN ('Approved', 'Completed');
```

### Filter cats by age range (in months)
```sql
SELECT * FROM AvailableCats
WHERE age_months BETWEEN 3 AND 24;
```

### Filter cats by multiple breeds and gender
```sql
SELECT * FROM AvailableCats
WHERE breed IN ('Persian', 'Siamese') AND gender = 'Female';
```

### Sort all cats by adoption status (available first)
```sql
SELECT * FROM AllCatsWithAge
ORDER BY is_available DESC, shelter_name ASC;
```

---

## Integrity & Domain Constraints Summary

| Constraint Type | Where Applied |
|----------------|--------------|
| PRIMARY KEY | All tables on their ID columns |
| FOREIGN KEY | Adoption -> User & Cat |
| NOT NULL | Required fields: email, breed, gender, dob, shelter_name, etc. |
| UNIQUE | User.email, Cat.shelter_name |
| ENUM / CHECK | role, gender, pickup_method, status -- restricted to valid values |
| DEFAULT | is_available = TRUE, role = 'user', status = 'Pending' |
| ON DELETE CASCADE | When a user or cat is deleted, related records clean up |

---

## Sample Seed Data (For Testing)

```sql
-- Add an admin user (password should be hashed in real app)
INSERT INTO User (full_name, email, password, role)
VALUES ('Admin Meow', 'admin@meowtopia.com', 'hashed_password_here', 'admin');

-- Add sample cats (with shelter_name and dob instead of age)
INSERT INTO Cat (shelter_name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url)
VALUES
('Whiskers', 'Siamese', 'Cream & Brown', '2024-03-01', 'Male', '2025-03-01', 'Healthy', 'Sassy', '/uploads/cats/siamese_1.jpg'),
('Snowball', 'Persian', 'White', '2024-07-15', 'Female', '2025-01-15', 'Vaccinated', 'Chill', '/uploads/cats/persian_1.jpg'),
('Mittens', 'Maine Coon', 'Tabby', '2023-11-20', 'Female', '2025-02-10', 'Healthy', 'Playful', '/uploads/cats/mainecoon_1.jpg'),
('Shadow', 'Bombay', 'Black', '2024-09-05', 'Male', '2025-04-01', 'Under Treatment', 'Shy', '/uploads/cats/bombay_1.jpg'),
('Ginger', 'British Shorthair', 'Orange', '2024-01-10', 'Male', '2025-01-20', 'Healthy', 'Curious', '/uploads/cats/british_1.jpg');
```

---

## Notes for the Team
- Always run the DDL file first to create tables, then the seed data
- If you modify a table structure, note the changes -- it may require recreating the table or writing an `ALTER TABLE` statement
- Use the views instead of writing complex JOINs repeatedly in the backend
- Triggers run automatically -- the backend doesn't need extra code to handle what triggers already cover
- Keep a `.sql` file for all your DDL + seed data so the database can be recreated easily (useful for demos and submissions)
- **`age` is never stored** -- always derived from `dob`. If you need age anywhere, use `TIMESTAMPDIFF(MONTH, dob, CURDATE())`
- **`shelter_name`** is the admin-given temporary name for a cat before adoption -- it must be unique and is the main identifier on the browse page
- **No food, cart, or purchase tables** -- this is an adoption-only platform
