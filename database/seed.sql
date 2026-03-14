USE meowtopia_db;

-- Password hashes are bcrypt hashes generated from:
-- admin123, sam123
INSERT INTO `User` (full_name, email, password, phone, address, role)
VALUES
('Admin Meow', 'admin@meowtopia.com', '$2b$10$HhN3Uud4w.6hS6SK2wI5YeI4zJxAXArA2EtpM9fB3Pczm6jVgV2Qm', '9876543210', 'Meowtopia HQ', 'admin'),
('Sam Johnson', 'sam@example.com', '$2b$10$X5f4MznzvA4HECAv7xM5iOhYyM5gtA5wSVUcgf0R7f5mM3GNQhP.q', '1234567890', '123 Cat Street, Mewville', 'user');

INSERT INTO Cat (shelter_name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url, photo_position)
VALUES
('Snowball', 'Persian', 'White', '2024-07-15', 'Female', '2025-01-15', 'Vaccinated', 'Chill', 'https://cdn2.thecatapi.com/images/ebv.jpg', 'center'),
('Whiskers', 'Siamese', 'Cream & Brown', '2024-03-01', 'Male', '2025-03-01', 'Healthy', 'Sassy', 'https://cdn2.thecatapi.com/images/ai6Jps4sx.jpg', 'center'),
('Mittens', 'Maine Coon', 'Tabby', '2023-11-20', 'Male', '2024-11-20', 'Healthy', 'Playful', 'https://cdn2.thecatapi.com/images/OGTWqNNOt.jpg', 'center'),
('Pudding', 'Ragdoll', 'White & Gray', '2025-06-10', 'Female', '2025-05-10', 'Vaccinated', 'Cuddly', 'https://cdn2.thecatapi.com/images/j5cVSqLer.jpg', 'center'),
('Shadow', 'British Shorthair', 'Gray', '2023-01-05', 'Male', '2024-08-05', 'Healthy', 'Lazy', 'https://cdn2.thecatapi.com/images/s4wQHTcjM.jpg', 'center'),
('Tigress', 'Bengal', 'Spotted Brown', '2025-02-28', 'Female', '2025-02-28', 'Under Treatment', 'Energetic', 'https://cdn2.thecatapi.com/images/IFXsxIreu.jpg', 'center'),
('Ginger', 'Scottish Fold', 'Orange', '2024-08-12', 'Female', '2025-04-12', 'Healthy', 'Sweet', 'https://cdn2.thecatapi.com/images/ZJKzGLEbY.jpg', 'center'),
('Sphinx', 'Sphynx', 'Pink', '2024-01-30', 'Male', '2025-01-30', 'Vaccinated', 'Mischievous', 'https://cdn2.thecatapi.com/images/KJF8fB_20.jpg', 'center'),
('Caramel', 'Abyssinian', 'Tawny', '2025-06-01', 'Male', '2025-06-01', 'Healthy', 'Curious', 'https://cdn2.thecatapi.com/images/pbuqsGBaa.jpg', 'center'),
('Duchess', 'Russian Blue', 'Silver-Blue', '2024-09-20', 'Female', '2025-03-20', 'Vaccinated', 'Gentle', 'https://cdn2.thecatapi.com/images/mOBxKGjMQ.jpg', 'center');
