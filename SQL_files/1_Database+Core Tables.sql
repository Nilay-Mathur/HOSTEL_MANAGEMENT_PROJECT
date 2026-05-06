CREATE DATABASE hostel_management;
USE hostel_management;

-- STUDENT
CREATE TABLE Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    gender ENUM('Male','Female','Other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HOSTEL
CREATE TABLE Hostel (
    hostel_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    gender ENUM('Male','Female','Other') NOT NULL
);

-- ROOM
CREATE TABLE Room (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    occupied_count INT DEFAULT 0,
    
    UNIQUE(hostel_id, room_number),

    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
        ON DELETE CASCADE
);