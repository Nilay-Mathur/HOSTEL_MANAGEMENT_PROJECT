const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DB CONNECTION
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Chopasni@79',
  database: 'hostel_management'
});

db.connect(err => {
  if (err) {
    console.error('DB Connection Failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// DASHBOARD
app.get('/api/stats', (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM Student) AS total_students,
      (SELECT COUNT(*) FROM Hostel) AS total_hostels,
      (SELECT COUNT(*) FROM Room) AS total_rooms,
      COUNT(DISTINCT a.student_id) AS allocated,
      GREATEST(
        (SELECT COUNT(*) FROM Student) - COUNT(DISTINCT a.student_id),
        0
      ) AS unallocated,
      (SELECT IFNULL(SUM(capacity),0) FROM Room) AS total_capacity,
      COUNT(DISTINCT a.student_id) AS total_occupied,
      (SELECT COUNT(*) FROM Complaint WHERE status = 'Open') AS open_complaints,
      (SELECT IFNULL(SUM(amount),0) FROM Fees WHERE status = 'Pending') AS pending_fees
    FROM Allocation a
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// STUDENTS
app.get('/api/students', (req, res) => {
  db.query('SELECT * FROM Student', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/students', (req, res) => {
  const { roll_no, name, email, phone, gender } = req.body;

  db.query(
    'INSERT INTO Student (roll_no, name, email, phone, gender) VALUES (?, ?, ?, ?, ?)',
    [roll_no, name, email, phone, gender],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Student added' });
    }
  );
});

// ✅ DELETE STUDENT (FIXED)
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM Allocation WHERE student_id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);

    db.query('DELETE FROM Fees WHERE student_id = ?', [id], (err) => {
      if (err) return res.status(500).json(err);

      db.query('DELETE FROM Complaint WHERE student_id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);

        db.query('DELETE FROM Student WHERE student_id = ?', [id], (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: 'Student and related data deleted successfully' });
        });
      });
    });
  });
});

// HOSTELS
app.get('/api/hostels', (req, res) => {
  db.query('SELECT * FROM Hostel', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/hostels', (req, res) => {
  const { name, gender } = req.body;

  db.query(
    'INSERT INTO Hostel (name, gender) VALUES (?, ?)',
    [name, gender],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Hostel added' });
    }
  );
});

// ROOMS
app.get('/api/rooms', (req, res) => {
  const query = `
    SELECT 
      r.*,
      h.name AS hostel_name,
      h.gender AS hostel_gender,
      (SELECT COUNT(*) FROM Allocation a WHERE a.room_id = r.room_id) AS occupied_count
    FROM Room r
    JOIN Hostel h ON r.hostel_id = h.hostel_id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/rooms', (req, res) => {
  const { hostel_id, room_number, capacity } = req.body;

  db.query(
    'INSERT INTO Room (hostel_id, room_number, capacity) VALUES (?, ?, ?)',
    [hostel_id, room_number, capacity],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Room added' });
    }
  );
});

// ALLOCATIONS
app.get('/api/allocations', (req, res) => {
  const query = `
    SELECT 
      a.allocation_id,
      a.allocation_date,
      s.name AS student_name,
      s.roll_no,
      h.name AS hostel_name,
      r.room_number
    FROM Allocation a
    JOIN Student s ON a.student_id = s.student_id
    JOIN Room r ON a.room_id = r.room_id
    JOIN Hostel h ON r.hostel_id = h.hostel_id
    ORDER BY a.allocation_date DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/allocations', (req, res) => {
  const { student_id, room_id } = req.body;

  db.query(
    'INSERT INTO Allocation (student_id, room_id) VALUES (?, ?)',
    [student_id, room_id],
    (err) => {
      if (err) return res.status(400).json({ error: err.sqlMessage });
      res.json({ message: 'Allocation successful' });
    }
  );
});

app.delete('/api/allocations/:id', (req, res) => {
  db.query(
    'DELETE FROM Allocation WHERE allocation_id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Deallocated successfully' });
    }
  );
});

// FEES
app.get('/api/fees', (req, res) => {
  db.query(
    `SELECT f.*, s.name AS student_name, s.roll_no
     FROM Fees f 
     JOIN Student s ON f.student_id = s.student_id
     ORDER BY f.payment_date DESC`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

app.post('/api/fees', (req, res) => {
  const { student_id, amount, payment_date, status } = req.body;

  db.query(
    'INSERT INTO Fees (student_id, amount, payment_date, status) VALUES (?, ?, ?, ?)',
    [student_id, amount, payment_date, status],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Fee recorded' });
    }
  );
});

app.patch('/api/fees/:id', (req, res) => {
  db.query(
    `UPDATE Fees SET status = 'Paid', payment_date = NOW() WHERE fee_id = ?`,
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Fee updated' });
    }
  );
});

// COMPLAINTS
app.get('/api/complaints', (req, res) => {
  db.query(
    `SELECT c.*, s.name AS student_name, s.roll_no
     FROM Complaint c 
     JOIN Student s ON c.student_id = s.student_id
     ORDER BY c.created_at DESC`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

app.post('/api/complaints', (req, res) => {
  const { student_id, description } = req.body;

  db.query(
    'INSERT INTO Complaint (student_id, description) VALUES (?, ?)',
    [student_id, description],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Complaint registered' });
    }
  );
});

app.patch('/api/complaints/:id', (req, res) => {
  db.query(
    'UPDATE Complaint SET status = ? WHERE complaint_id = ?',
    [req.body.status, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Complaint updated' });
    }
  );
});

// START SERVER
app.listen(3001, () => {
  console.log('Server running on port 3001');
});