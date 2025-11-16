-- Optional init script if you prefer SQL bootstrap instead of env vars
CREATE DATABASE IF NOT EXISTS `bookstore` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'book_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON `bookstore`.* TO 'book_user'@'%';
FLUSH PRIVILEGES;

