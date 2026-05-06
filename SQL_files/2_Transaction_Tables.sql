-- ALLOCATION
CREATE TABLE Allocation (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNIQUE,
    room_id INT NOT NULL,
    allocation_date DATE DEFAULT (CURRENT_DATE),

    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE,

    FOREIGN KEY (room_id) REFERENCES Room(room_id)
        ON DELETE CASCADE
);

-- FEES
CREATE TABLE Fees (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    status ENUM('Paid','Pending') DEFAULT 'Pending',

    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE
);

-- COMPLAINT
CREATE TABLE Complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    description TEXT NOT NULL,
    status ENUM('Open','In Progress','Resolved') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE
);