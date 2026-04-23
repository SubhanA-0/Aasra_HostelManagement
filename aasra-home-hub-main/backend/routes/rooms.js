const express = require('express');
const db = require('../db');
const { authenticateToken, roleGuard } = require('../middleware/auth');

const jwt = require('jsonwebtoken');

const router = express.Router();

// POST /api/rooms — Create a room (owner only)
router.post('/', authenticateToken, roleGuard(['owner']), (req, res) => {
  const { hostel_name, room_number, room_type, capacity, rate } = req.body;

  if (!room_number || !rate || !hostel_name) {
    return res.status(400).json({ message: 'Hostel name, room number and rate are required' });
  }

  const type = room_type || 'Single';
  const cap = capacity || 1;

  db.run(
    'INSERT INTO rooms (hostel_name, room_number, room_type, capacity, rate, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
    [hostel_name, room_number, type, cap, rate, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating room' });
      }
      res.status(201).json({
        message: 'Room created successfully',
        room: {
          id: this.lastID,
          hostel_name,
          room_number,
          room_type: type,
          capacity: cap,
          rate,
          status: 'available',
          owner_id: req.user.id,
        },
      });
    }
  );
});

// GET /api/rooms/my-room — Get the assigned room for a student
router.get('/my-room', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can have an assigned room' });
  }

  db.get('SELECT * FROM rooms WHERE assigned_student_id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!row) return res.status(404).json({ message: 'No room assigned yet' });
    res.json({ room: row });
  });
});

// GET /api/rooms — List rooms
router.get('/', (req, res) => {
  let query, params;
  let user = null;

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try { 
      // Optional verification
      const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
      user = jwt.verify(token, JWT_SECRET); 
    } catch (err) {}
  }

  if (user && user.role === 'owner') {
    // Owners see only their own rooms
    query = 'SELECT * FROM rooms WHERE owner_id = ?';
    params = [user.id];
  } else {
    // Students and Unauthenticated Guests see all rooms
    query = 'SELECT * FROM rooms';
    params = [];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching rooms' });
    }
    res.json({ rooms: rows });
  });
});

// PUT /api/rooms/:id/assign — Assign a student to a room (owner only)
router.put('/:id/assign', authenticateToken, roleGuard(['owner']), (req, res) => {
  const { studentId } = req.body;
  const roomId = req.params.id;

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required' });
  }

  // Ownership check: WHERE id = ? AND owner_id = req.user.id
  db.get(
    'SELECT * FROM rooms WHERE id = ? AND owner_id = ?',
    [roomId, req.user.id],
    (err, room) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (!room) {
        return res.status(404).json({ message: 'Room not found or you do not own this room' });
      }
      if (room.status === 'occupied') {
        return res.status(400).json({ message: 'Room not available' });
      }

      db.run(
        'UPDATE rooms SET status = ?, assigned_student_id = ? WHERE id = ? AND owner_id = ?',
        ['occupied', studentId, roomId, req.user.id],
        function (err) {
          if (err) {
            return res.status(500).json({ message: 'Error assigning student' });
          }
          res.json({
            message: 'Student assigned successfully',
            room: {
              id: parseInt(roomId),
              status: 'occupied',
              assigned_student_id: studentId,
            },
          });
        }
      );
    }
  );
});

module.exports = router;
