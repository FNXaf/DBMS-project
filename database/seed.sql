USE meowtopia_db;

-- Password hashes are bcrypt hashes generated from:
-- admin123, sam123
INSERT INTO `User` (full_name, email, password, phone, address, role)
VALUES
('Sam Badal', 'admin@meowtopia.com', '$2b$10$sqQuFnAfHtYmNpJ7NR2qle7kZpfZj2ahwZavTu6ux7Xny89PGFMCS', '9876543210', 'Meowtopia HQ', 'admin'),
('User One', 'user1@example.com', '$2b$10$BOna9vRz72TAERvvT9oRDuy8X/SP3UWH2T3TNjfmcVqXjmyak/00i', '1234567890', '123 Cat Street, Mewville', 'user');
