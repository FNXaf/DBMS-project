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
| Strong & Weak Entity Sets | e.g., Cat_Food_Preference depends on both Cat and Food; Purchase_Item depends on Purchase |
| Relational Model & SQL | All DDL and DML queries |
| Views | Useful views for dashboard, admin, food store, and age computation |
| Triggers | Auto-update cat availability on adoption; auto-decrement inventory on purchase |
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
- `Cart` (weak entity — depends on User and Food)
- `Purchase` (strong entity — records completed orders)
- `Purchase_Item` (weak/associative entity — depends on Purchase and Food)

**Relationships:**
- `User` **makes** `Adoption` — one user can make many adoptions
- `Adoption` **involves** `Cat` — each adoption is for one cat
- `Cat` **has preference for** `Food` — many-to-many (Cat_Food_Preference)
- `User` **has** `Cart` items — one user can have many items in cart
- `User` **makes** `Purchase` — one user can have many purchases
- `Purchase` **contains** `Purchase_Item` — one purchase has many line items
- `Purchase_Item` **references** `Food` — each line item is for one food

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
    shelter_name    VARCHAR(100) NOT NULL UNIQUE,  -- temporary name given by admin, displayed as card title
    name            VARCHAR(100) DEFAULT NULL,      -- null until adoption; owner gives permanent name
    breed           VARCHAR(100) NOT NULL,
    fur_color       VARCHAR(50),
    dob             DATE NOT NULL,                  -- Date of Birth — age is DERIVED, never stored
    gender          ENUM('Male', 'Female') NOT NULL,
    intake_date     DATE NOT NULL,
    health_status   VARCHAR(100) DEFAULT 'Healthy',
    cattitude       VARCHAR(100),                   -- personality trait, fun field
    photo_url       VARCHAR(255),
    photo_position  VARCHAR(10) DEFAULT 'center',  -- CSS object-position for photo crop (center/top/bottom)
    is_available    BOOLEAN DEFAULT TRUE
);
-- NOTE: Age is computed as TIMESTAMPDIFF(MONTH, dob, CURDATE()) wherever needed.
-- Never store age as a column — always derive it from dob.

-- Food table
CREATE TABLE Food (
    foodid      INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    qty         INT DEFAULT 0,          -- stock quantity, decremented on purchase
    price       DECIMAL(10, 2) NOT NULL,
    image_url   VARCHAR(255),           -- product image URL
    emoji       VARCHAR(10)             -- display emoji for UI cards
);

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

-- Cat_Food_Preference table (many-to-many: Cat prefers Food)
CREATE TABLE Cat_Food_Preference (
    catid   INT NOT NULL,
    foodid  INT NOT NULL,
    PRIMARY KEY (catid, foodid),
    FOREIGN KEY (catid) REFERENCES Cat(catid) ON DELETE CASCADE,
    FOREIGN KEY (foodid) REFERENCES Food(foodid) ON DELETE CASCADE
);

-- Cart table (temporary shopping cart for food store)
CREATE TABLE Cart (
    cartid      INT AUTO_INCREMENT PRIMARY KEY,
    userid      INT NOT NULL,
    foodid      INT NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES User(userid) ON DELETE CASCADE,
    FOREIGN KEY (foodid) REFERENCES Food(foodid) ON DELETE CASCADE
);

-- Purchase table (completed food orders)
CREATE TABLE Purchase (
    purchaseid      INT AUTO_INCREMENT PRIMARY KEY,
    userid          INT NOT NULL,
    total_amount    DECIMAL(10, 2) NOT NULL,
    purchase_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES User(userid) ON DELETE CASCADE
);

-- Purchase_Item table (line items within a purchase)
CREATE TABLE Purchase_Item (
    purchase_itemid INT AUTO_INCREMENT PRIMARY KEY,
    purchaseid      INT NOT NULL,
    foodid          INT NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(10, 2) NOT NULL,  -- price at time of purchase (snapshot)
    FOREIGN KEY (purchaseid) REFERENCES Purchase(purchaseid) ON DELETE CASCADE,
    FOREIGN KEY (foodid) REFERENCES Food(foodid) ON DELETE CASCADE
);
```

---

## Normalization Notes (For Your Report/Viva)

All tables are designed to **3NF (Third Normal Form)**:

- **1NF:** All attributes are atomic (no multi-valued fields; Cat_Food_Preference handles multi-valued food preferences; Purchase_Item handles multi-valued order contents)
- **2NF:** No partial dependencies (all non-key attributes fully depend on the whole primary key)
- **3NF:** No transitive dependencies (e.g., food price doesn't depend on catid — it lives in the Food table; `unit_price` in Purchase_Item is a snapshot, not a dependency on Food)

The `Cat_Food_Preference` junction table removes the many-to-many relationship between Cat and Food. The `Purchase_Item` junction table removes the many-to-many between Purchase and Food. Both achieve proper normalization.

**Derived attribute:** `age` is NOT stored — it is computed from `dob` using `TIMESTAMPDIFF(MONTH, dob, CURDATE())`. This avoids data staleness and is a good example of a derived attribute (relevant in ER modeling theory).

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

### Trigger 3: Auto-decrement Food Inventory on Purchase Item Insert

```sql
DELIMITER $$

CREATE TRIGGER after_purchase_item_insert
AFTER INSERT ON Purchase_Item
FOR EACH ROW
BEGIN
    UPDATE Food
    SET qty = qty - NEW.quantity
    WHERE foodid = NEW.foodid;
END$$

DELIMITER ;
```
> When a purchase item is recorded, the food stock is automatically decremented. The backend should still verify stock availability BEFORE inserting, but this trigger ensures consistency at the DB level.

### Trigger 4: Prevent Purchase of Out-of-Stock Food

```sql
DELIMITER $$

CREATE TRIGGER before_purchase_item_insert
BEFORE INSERT ON Purchase_Item
FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    SELECT qty INTO current_stock FROM Food WHERE foodid = NEW.foodid;
    IF current_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock for this food item.';
    END IF;
END$$

DELIMITER ;
```
> Prevents purchasing more units than available in stock — database-level safety net.

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
    photo_url
FROM Cat
WHERE is_available = TRUE;
```
> Includes the computed `age_months` derived from `dob`. The browse page uses this view instead of querying Cat directly.

### View 2: Owner's Cats with Food Preferences (for Dashboard)

```sql
CREATE VIEW OwnerCatSuggestions AS
SELECT
    u.userid,
    u.full_name,
    a.cat_name_given,
    c.shelter_name,
    c.breed,
    c.dob,
    TIMESTAMPDIFF(MONTH, c.dob, CURDATE()) AS age_months,
    c.cattitude,
    c.photo_url,
    f.foodid,
    f.name AS food_name,
    f.price AS food_price
FROM Adoption a
JOIN User u ON a.userid = u.userid
JOIN Cat c ON a.catid = c.catid
JOIN Cat_Food_Preference cfp ON c.catid = cfp.catid
JOIN Food f ON cfp.foodid = f.foodid
WHERE a.status IN ('Approved', 'Completed');
```
> Powers the _"Buy [food] for your [cat name]"_ suggestion on the owner dashboard AND the "Suggested Products" section in the Food Store.

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

### View 4: Food Store — Suggested Products for an Owner

```sql
CREATE VIEW OwnerFoodSuggestions AS
SELECT DISTINCT
    a.userid,
    f.foodid,
    f.name AS food_name,
    f.price,
    f.qty AS stock
FROM Adoption a
JOIN Cat c ON a.catid = c.catid
JOIN Cat_Food_Preference cfp ON c.catid = cfp.catid
JOIN Food f ON cfp.foodid = f.foodid
WHERE a.status IN ('Approved', 'Completed');
```
> Query with `WHERE userid = ?` to get suggested products for a specific owner. Uses DISTINCT to avoid duplicates when multiple cats prefer the same food.

### View 5: Purchase History for a User

```sql
CREATE VIEW UserPurchaseHistory AS
SELECT
    p.purchaseid,
    p.userid,
    p.total_amount,
    p.purchase_date,
    pi.foodid,
    f.name AS food_name,
    pi.quantity,
    pi.unit_price
FROM Purchase p
JOIN Purchase_Item pi ON p.purchaseid = pi.purchaseid
JOIN Food f ON pi.foodid = f.foodid;
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
SELECT a.cat_name_given, c.shelter_name, c.breed, c.cattitude, c.photo_url,
       TIMESTAMPDIFF(MONTH, c.dob, CURDATE()) AS age_months
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

### Add item to cart
```sql
INSERT INTO Cart (userid, foodid, quantity)
VALUES (3, 2, 1);
```

### Get user's cart with food details
```sql
SELECT c.cartid, f.name, f.price, c.quantity, (f.price * c.quantity) AS subtotal
FROM Cart c
JOIN Food f ON c.foodid = f.foodid
WHERE c.userid = 3;
```

### Process checkout (within a transaction)
```sql
START TRANSACTION;

-- Create order
INSERT INTO Purchase (userid, total_amount) VALUES (3, 305.00);
SET @pid = LAST_INSERT_ID();

-- Insert line items (triggers auto-decrement food.qty)
INSERT INTO Purchase_Item (purchaseid, foodid, quantity, unit_price) VALUES (@pid, 2, 1, 85.00);
INSERT INTO Purchase_Item (purchaseid, foodid, quantity, unit_price) VALUES (@pid, 1, 1, 120.00);
INSERT INTO Purchase_Item (purchaseid, foodid, quantity, unit_price) VALUES (@pid, 4, 1, 100.00);

-- Clear cart
DELETE FROM Cart WHERE userid = 3;

COMMIT;
```

### Get suggested products for an owner
```sql
SELECT DISTINCT f.foodid, f.name, f.price, f.qty
FROM Adoption a
JOIN Cat c ON a.catid = c.catid
JOIN Cat_Food_Preference cfp ON c.catid = cfp.catid
JOIN Food f ON cfp.foodid = f.foodid
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

---

## Integrity & Domain Constraints Summary

| Constraint Type | Where Applied |
|----------------|--------------|
| PRIMARY KEY | All tables on their ID columns |
| FOREIGN KEY | Adoption → User & Cat, Cat_Food_Preference → Cat & Food, Cart → User & Food, Purchase → User, Purchase_Item → Purchase & Food |
| NOT NULL | Required fields: email, breed, gender, dob, shelter_name, etc. |
| UNIQUE | User.email, Cat.shelter_name |
| ENUM / CHECK | role, gender, pickup_method, status — restricted to valid values |
| DEFAULT | is_available = TRUE, role = 'user', status = 'Pending', qty = 0 |
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

-- Add sample cats (with shelter_name and dob instead of age)
INSERT INTO Cat (shelter_name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url)
VALUES
('Whiskers', 'Siamese', 'Cream & Brown', '2024-03-01', 'Male', '2025-03-01', 'Healthy', 'Sassy', '/uploads/cats/siamese_1.jpg'),
('Snowball', 'Persian', 'White', '2024-07-15', 'Female', '2025-01-15', 'Vaccinated', 'Chill', '/uploads/cats/persian_1.jpg'),
('Mittens', 'Maine Coon', 'Tabby', '2023-11-20', 'Female', '2025-02-10', 'Healthy', 'Playful', '/uploads/cats/mainecoon_1.jpg'),
('Shadow', 'Bombay', 'Black', '2024-09-05', 'Male', '2025-04-01', 'Under Treatment', 'Shy', '/uploads/cats/bombay_1.jpg'),
('Ginger', 'British Shorthair', 'Orange', '2024-01-10', 'Male', '2025-01-20', 'Healthy', 'Curious', '/uploads/cats/british_1.jpg');

-- Set food preferences for cats
INSERT INTO Cat_Food_Preference (catid, foodid) VALUES
(1, 1), (1, 2),    -- Whiskers likes Cat Milk and Tuna Bites
(2, 3), (2, 5),    -- Snowball likes Dry Kibble and Chicken Pâté
(3, 1), (3, 4),    -- Mittens likes Cat Milk and Salmon Treats
(4, 2), (4, 3),    -- Shadow likes Tuna Bites and Dry Kibble
(5, 4), (5, 5);    -- Ginger likes Salmon Treats and Chicken Pâté
```

---

## Notes for the Team
- Always run the DDL file first to create tables, then the seed data
- If you modify a table structure, note the changes — it may require recreating the table or writing an `ALTER TABLE` statement
- Use the views instead of writing complex JOINs repeatedly in the backend
- Triggers run automatically — the backend doesn't need extra code to handle what triggers already cover
- Keep a `.sql` file for all your DDL + seed data so the database can be recreated easily (useful for demos and submissions)
- **`age` is never stored** — always derived from `dob`. If you need age anywhere, use `TIMESTAMPDIFF(MONTH, dob, CURDATE())`
- **`shelter_name`** is the admin-given temporary name for a cat before adoption — it must be unique and is the main identifier on the browse page
