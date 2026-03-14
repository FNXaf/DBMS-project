USE meowtopia_db;

-- 1) Get available cats with age in months
SELECT * FROM AvailableCats ORDER BY shelter_name;

-- 2) Filter by multiple breeds and gender
SELECT *
FROM AvailableCats
WHERE breed IN ('Persian', 'Siamese')
  AND gender = 'Female';

-- 3) Filter by age range
SELECT *
FROM AvailableCats
WHERE age_months BETWEEN 3 AND 24
ORDER BY age_months ASC;

-- 4) Admin adoption overview
SELECT * FROM AdminAdoptionOverview ORDER BY adoption_date DESC;

-- 5) All cats available first
SELECT *
FROM AllCatsWithAge
ORDER BY is_available DESC, shelter_name ASC;
