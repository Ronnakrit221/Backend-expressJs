const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// ใช้ cors และ body-parser
app.use(cors());
app.use(bodyParser.json()); // เพิ่มการใช้ body-parser


// เชื่อมต่อกับ MariaDB
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'database name'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MariaDB');
});

// สร้างตาราง todos (ถ้ายังไม่มี)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false
  );
`;

db.query(createTableQuery, (err) => {
  if (err) throw err;
  console.log('Todos table is ready');
});

// API สำหรับ GET รายการ To-Do
app.get('/api/todos', (req, res) => {
  db.query('SELECT * FROM todos', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// API สำหรับ POST เพิ่มรายการ To-Do
app.post('/api/todos', (req, res) => {
  const { title, completed } = req.body;
  db.query('INSERT INTO todos (title, completed) VALUES (?, ?)', [title, completed], (err, results) => {
    if (err) throw err;
    res.status(201).json({ id: results.insertId, title, completed });
  });
});

// API สำหรับ PUT อัปเดตสถานะของ To-Do
app.put('/api/todos/:id/upcom', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], (err, results) => {
    if (err) throw err;
    res.json({ id, completed });
  });
});

// API สำหรับ DELETE ลบรายการ To-Do
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    res.status(204).send();
  });
});

// API สำหรับ PUT อัปเดต To-Do
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  db.query('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [title, completed, id], (err, results) => {
    if (err) {
      console.error("Error updating data:", err); // แสดงข้อผิดพลาดถ้ามี
      return res.status(500).json({ error: 'Database update failed' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // ส่งข้อมูลกลับใน response
    res.json({ id, title, completed });
  });
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
