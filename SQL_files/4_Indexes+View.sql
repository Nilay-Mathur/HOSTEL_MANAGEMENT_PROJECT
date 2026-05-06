-- INDEXES (performance)
CREATE INDEX idx_student_name ON Student(name);
CREATE INDEX idx_room_hostel ON Room(hostel_id);
CREATE INDEX idx_allocation_room ON Allocation(room_id);

-- VIEW (for frontend)
CREATE VIEW student_room_view AS
SELECT 
    s.name,
    s.roll_no,
    r.room_number,
    h.name AS hostel_name
FROM Student s
JOIN Allocation a ON s.student_id = a.student_id
JOIN Room r ON a.room_id = r.room_id
JOIN Hostel h ON r.hostel_id = h.hostel_id;