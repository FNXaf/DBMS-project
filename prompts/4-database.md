# 🗄️ Meowtopia — Database Prompt

## Context
You are helping design and implement the **database layer** of Meowtopia, a cat adoption platform built as an academic DBMS project. This database should reflect what is actually studied in the course — ER modeling, SQL (DDL + DML), normalization, views, and triggers. Keep it practical and aligned with academic expectations.

For full system context, refer to the **Main System Prompt**. This prompt focuses specifically on the database design and SQL implementation.

---

## DBMS Concepts Covered (From Course — Applied Here)
| Course Topic | Applied As |
|-------------|-----------|
| ER Model & ER Diagram | Entity-relationship design for all tables |
| Entities, Attributes, Keys | All tables with PKs, FKs, and attributes |
| Strong & Weak Entity Sets | e.g., Cat_Food_Preference depends on both Cat and Food |
| Relational Model & SQL | All DDL and DML queries |
| Views | Useful views for dashboard and admin |
| Triggers | Auto-update cat availability on adoption |
| Functional Dependencies & Normalization | Tables designed to 3NF |
| Integrity & Domain Constraints | NOT NULL, UNIQUE, CHECK, FK constraints |
| Assertions / Triggers | Use triggers as practical alternative to assertions |

> ⚠️ Skip: Crash recovery, concurrency control, B+ trees, hashing, distributed/OO databases — not needed for this project.

---

## ER Diagram (Conceptual — Describe to Your AI Agent)

**Entities:**
- `User` (strong entity)
- `Cat` (strong entity)
- `Food` (strong entity)
- `Adoption` (can be modeled as a relationship-turned-entity between User and Cat)
- `Cat_Food_Preference` (weak/associative entity between Cat and Food)

**Relationships:**
- `User` **makes** `Adoption` — one user can make many adoptions
- `Adoption` **involves** `Cat` — each adoption is for one cat
- `Cat` **has preference for** `Food` — many-to-many (Cat_Food_Preference)

---

## DDL — Table Definitions

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
    name            VARCHAR(100) DEFAULT NULL,  -- null until adoption
    breed           VARCHAR(100) NOT NULL,
    fur_color       VARCHAR(50),
    age             VARCHAR(20),  -- e.g., "3 months", "2 years"
    gender          ENUM('Male', 'Female') NOT NULL,
    intake_date     DATE NOT NULL,
    health_status   VARCHAR(100) DEFAULT 'Healthy',
    cattitude       VARCHAR(100),  -- personality trait, fun field
    photo_url       VARCHAR(255),
    is_available    BOOLEAN DEFAULT TRUE
);

-- Food table
CREATE TABLE Food (
    foodid  INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    qty     INT DEFAULT 0,
    price   DECIMAL(10, 2) NOT NULL
);

-- Adoption table (relationship entity between User and Cat)
CREATE TABLE Adoption (
    adoptionid      INT AUTO_INCREMENT PRIMARY KEY,
    userid          INT NOT NULL,
    catid           INT NOT NULL,
    cat_name_given  VARCHAR(100),  -- name chosen by adopter
    adoption_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_method   ENUM('pickup', 'delivery') NOT NULL,
    status          ENUM('Pending', 'Approved', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (userid) REFERENCES User(userid) ON DELETE CASCADE,
    FOREIGN KEY (catid) REFERENCES Cat(catid) ON DELETE CASCADE
);

-- Cat_Food_Preference table (many-to-many: Cat prefers Food)
CREATE TABLE Cat_Food_Preference (
    catid   INT NOT NULL,
    foodid  INT NOT NULL,
    PRIMARY KEY (catid, foodid),
    FOREIGN KEY (catid) REFERENCES Cat(catid) ON DELETE CASCADE,
    FOREIGN KEY (foodid) REFERENCES Food(foodid) ON DELETE CASCADE
);
```

---

## Normalization Notes (For Your Report/Viva)

All tables are designed to **3NF (Third Normal Form)**:

- **1NF:** All attributes are atomic (no multi-valued fields; Cat_Food_Preference handles multi-valued food preferences)
- **2NF:** No partial dependencies (all non-key attributes fully depend on the whole primary key)
- **3NF:** No transitive dependencies (e.g., food price doesn't depend on catid — it lives in the Food table)

The `Cat_Food_Preference` junction table removes the many-to-many relationship between Cat and Food, achieving proper normalization.

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
> This ensures that when an adoption record is created, the cat is automatically marked as unavailable — no need to handle this in application code separately.

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

### View 1: Available Cats (for Browse Page)

```sql
CREATE VIEW AvailableCats AS
SELECT catid, breed, fur_color, age, gender, cattitude, health_status, photo_url
FROM Cat
WHERE is_available = TRUE;
```

### View 2: Owner's Cats with Food Preferences (for Dashboard)

```sql
CREATE VIEW OwnerCatSuggestions AS
SELECT
    u.userid,
    u.full_name,
    a.cat_name_given,
    c.breed,
    c.cattitude,
    c.photo_url,
    f.name AS food_name,
    f.price AS food_price
FROM Adoption a
JOIN User u ON a.userid = u.userid
JOIN Cat c ON a.catid = c.catid
JOIN Cat_Food_Preference cfp ON c.catid = cfp.catid
JOIN Food f ON cfp.foodid = f.foodid
WHERE a.status IN ('Approved', 'Completed');
```
> This view is what powers the _"Buy [food] for your [cat name]"_ suggestion on the owner dashboard.

### View 3: Admin Adoption Overview

```sql
CREATE VIEW AdminAdoptionOverview AS
SELECT
    a.adoptionid,
    u.full_name AS adopter_name,
    u.email,
    a.cat_name_given,
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

### Insert a new cat
```sql
INSERT INTO Cat (breed, fur_color, age, gender, intake_date, health_status, cattitude, photo_url)
VALUES ('Persian', 'White', '6 months', 'Female', '2025-01-15', 'Vaccinated', 'Chill', '/uploads/cats/persian_1.jpg');
```

### Insert food preferences for a cat
```sql
INSERT INTO Cat_Food_Preference (catid, foodid) VALUES (1, 2);
INSERT INTO Cat_Food_Preference (catid, foodid) VALUES (1, 5);
```

### Get all food preferences for a cat
```sql
SELECT f.name, f.price
FROM Food f
JOIN Cat_Food_Preference cfp ON f.foodid = cfp.foodid
WHERE cfp.catid = 1;
```

### Get all cats owned by a specific user
```sql
SELECT a.cat_name_given, c.breed, c.cattitude, c.photo_url
FROM Adoption a
JOIN Cat c ON a.catid = c.catid
WHERE a.userid = 3 AND a.status IN ('Approved', 'Completed');
```

### Check if a user qualifies as an owner
```sql
SELECT COUNT(*) AS owned_count
FROM Adoption
WHERE userid = 3 AND status IN ('Approved', 'Completed');
-- If owned_count > 0, they are a Cat Owner
```

---

## Integrity & Domain Constraints Summary

| Constraint Type | Where Applied |
|----------------|--------------|
| PRIMARY KEY | All tables on their ID columns |
| FOREIGN KEY | Adoption → User, Adoption → Cat, Cat_Food_Preference → Cat & Food |
| NOT NULL | Required fields like email, breed, gender |
| UNIQUE | User.email |
| ENUM / CHECK | role, gender, pickup_method, status — restricted to valid values |
| DEFAULT | is_available = TRUE, role = 'user', status = 'Pending' |
| ON DELETE CASCADE | When a user or cat is deleted, related records clean up |

---

## Sample Seed Data (For Testing)

```sql
-- Add food items
INSERT INTO Food (name, qty, price) VALUES
('Cat Milk', 50, 120.00),
('Tuna Bites', 30, 85.00),
('Dry Kibble', 100, 200.00),
('Salmon Treats', 40, 150.00),
('Chicken Pâté', 25, 95.00);

-- Add an admin user (password should be hashed in real app)
INSERT INTO User (full_name, email, password, role)
VALUES ('Admin Meow', 'admin@meowtopia.com', 'hashed_password_here', 'admin');

-- Add a sample cat
INSERT INTO Cat (breed, fur_color, age, gender, intake_date, health_status, cattitude, photo_url)
VALUES ('Siamese', 'Cream & Brown', '1 year', 'Male', '2025-03-01', 'Healthy', 'Sassy', '/uploads/cats/siamese_1.jpg');

-- Set food preferences for cat with catid = 1
INSERT INTO Cat_Food_Preference (catid, foodid) VALUES (1, 1), (1, 2);
```

---

## Notes for the Team
- Always run the DDL file first to create tables, then the seed data
- If you modify a table structure, note the changes — it may require recreating the table or writing an `ALTER TABLE` statement
- Use the views instead of writing complex JOINs repeatedly in the backend
- Triggers run automatically — the backend doesn't need extra code to handle what triggers already cover
- Keep a `.sql` file for all your DDL + seed data so the database can be recreated easily (useful for demos and submissions)
