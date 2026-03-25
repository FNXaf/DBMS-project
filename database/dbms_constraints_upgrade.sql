-- Meowtopia DBMS upgrade script (safe to run manually, not auto-executed)
-- Purpose:
-- 1) Add CHECK constraint: Cat.dob < Cat.intake_date
-- 2) Add UNIQUE constraint: Adoption(userid, catid)
-- 3) Re-create Adoption foreign keys with ON UPDATE CASCADE
--
-- NOTE:
-- - This script changes schema only.
-- - Run only after taking a backup if this is a production/demo-critical database.

USE meowtopia_db;

-- -------------------------------------------------------------------------
-- Section A: Clean up old constraints/indexes only if they already exist.
-- -------------------------------------------------------------------------

-- Drop FK Adoption -> User if present (name may vary by environment).
SET @fk_user_name := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'Adoption'
      AND kcu.COLUMN_NAME = 'userid'
      AND kcu.REFERENCED_TABLE_NAME = 'User'
    LIMIT 1
);
SET @sql := IF(
    @fk_user_name IS NULL,
    'SELECT ''FK Adoption.userid -> User.userid not found; skipping'' AS info',
    CONCAT('ALTER TABLE Adoption DROP FOREIGN KEY `', @fk_user_name, '`')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop FK Adoption -> Cat if present (name may vary by environment).
SET @fk_cat_name := (
    SELECT kcu.CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE kcu
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.TABLE_NAME = 'Adoption'
      AND kcu.COLUMN_NAME = 'catid'
      AND kcu.REFERENCED_TABLE_NAME = 'Cat'
    LIMIT 1
);
SET @sql := IF(
    @fk_cat_name IS NULL,
    'SELECT ''FK Adoption.catid -> Cat.catid not found; skipping'' AS info',
    CONCAT('ALTER TABLE Adoption DROP FOREIGN KEY `', @fk_cat_name, '`')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop old composite unique index if same name already exists.
SET @uq_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS s
    WHERE s.TABLE_SCHEMA = DATABASE()
      AND s.TABLE_NAME = 'Adoption'
      AND s.INDEX_NAME = 'uq_adoption_user_cat'
);
SET @sql := IF(
    @uq_exists = 0,
    'SELECT ''Index uq_adoption_user_cat not found; skipping'' AS info',
    'ALTER TABLE Adoption DROP INDEX uq_adoption_user_cat'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop old check constraint name if it exists.
SET @check_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS tc
    WHERE tc.TABLE_SCHEMA = DATABASE()
      AND tc.TABLE_NAME = 'Cat'
      AND tc.CONSTRAINT_TYPE = 'CHECK'
      AND tc.CONSTRAINT_NAME = 'chk_cat_dob_before_intake'
);
SET @sql := IF(
    @check_exists = 0,
    'SELECT ''CHECK chk_cat_dob_before_intake not found; skipping'' AS info',
    'ALTER TABLE Cat DROP CHECK chk_cat_dob_before_intake'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -------------------------------------------------------------------------
-- Section B: Add required DBMS constraints.
-- -------------------------------------------------------------------------

-- 1) CHECK constraint for valid date relationship.
ALTER TABLE Cat
    ADD CONSTRAINT chk_cat_dob_before_intake
    CHECK (dob < intake_date);

-- 2) Composite UNIQUE constraint to prevent duplicate user-cat adoption rows.
ALTER TABLE Adoption
    ADD CONSTRAINT uq_adoption_user_cat UNIQUE (userid, catid);

-- 3) Foreign keys with ON UPDATE CASCADE.
ALTER TABLE Adoption
    ADD CONSTRAINT fk_adoption_user
    FOREIGN KEY (userid) REFERENCES `User`(userid)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    ADD CONSTRAINT fk_adoption_cat
    FOREIGN KEY (catid) REFERENCES Cat(catid)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- -------------------------------------------------------------------------
-- Section C: Verification queries (read-only).
-- -------------------------------------------------------------------------

SELECT tc.TABLE_NAME, tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS tc
WHERE tc.TABLE_SCHEMA = DATABASE()
  AND tc.TABLE_NAME IN ('Cat', 'Adoption')
ORDER BY tc.TABLE_NAME, tc.CONSTRAINT_TYPE, tc.CONSTRAINT_NAME;

SELECT rc.CONSTRAINT_NAME, rc.UPDATE_RULE, rc.DELETE_RULE, rc.TABLE_NAME
FROM information_schema.REFERENTIAL_CONSTRAINTS rc
WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
  AND rc.TABLE_NAME = 'Adoption'
ORDER BY rc.CONSTRAINT_NAME;
