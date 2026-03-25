CREATE DATABASE IF NOT EXISTS meowtopia_db;
USE meowtopia_db;

DROP TRIGGER IF EXISTS before_adoption_insert;
DROP TRIGGER IF EXISTS after_adoption_insert;
DROP VIEW IF EXISTS AdminAdoptionOverview;
DROP VIEW IF EXISTS AllCatsWithAge;
DROP VIEW IF EXISTS AvailableCats;
DROP TABLE IF EXISTS Adoption;
DROP TABLE IF EXISTS Cat;
DROP TABLE IF EXISTS `User`;

CREATE TABLE `User` (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Cat (
    catid INT AUTO_INCREMENT PRIMARY KEY,
    shelter_name VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) DEFAULT NULL,
    breed VARCHAR(100) NOT NULL,
    fur_color VARCHAR(50),
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    intake_date DATE NOT NULL,
    health_status VARCHAR(100) DEFAULT 'Healthy',
    cattitude VARCHAR(100),
    photo_url VARCHAR(255),
    photo_position VARCHAR(10) DEFAULT 'center',
    is_available BOOLEAN DEFAULT TRUE,
    -- DBMS constraint: a cat's birth date must be earlier than intake date.
    CONSTRAINT chk_cat_dob_before_intake CHECK (dob < intake_date)
);

CREATE TABLE Adoption (
    adoptionid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    catid INT NOT NULL,
    cat_name_given VARCHAR(100),
    adoption_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_method ENUM('pickup', 'delivery') NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    -- DBMS constraint: same user cannot create duplicate requests for same cat.
    CONSTRAINT uq_adoption_user_cat UNIQUE (userid, catid),
    -- FK update cascade keeps child rows aligned if parent PK changes.
    FOREIGN KEY (userid) REFERENCES `User`(userid) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (catid) REFERENCES Cat(catid) ON DELETE CASCADE ON UPDATE CASCADE
);

DELIMITER $$

CREATE TRIGGER before_adoption_insert
BEFORE INSERT ON Adoption
FOR EACH ROW
BEGIN
    DECLARE cat_status BOOLEAN;
    SELECT is_available INTO cat_status
    FROM Cat
    WHERE catid = NEW.catid;

    IF cat_status = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This cat is no longer available for adoption.';
    END IF;
END$$

CREATE TRIGGER after_adoption_insert
AFTER INSERT ON Adoption
FOR EACH ROW
BEGIN
    UPDATE Cat
    SET is_available = FALSE,
        name = COALESCE(NEW.cat_name_given, name)
    WHERE catid = NEW.catid;
END$$

DELIMITER ;

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
    photo_position,
    is_available
FROM Cat
WHERE is_available = TRUE;

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
JOIN `User` u ON a.userid = u.userid
JOIN Cat c ON a.catid = c.catid;
