const express = require('express');
const db = require('../db');
const { authenticateToken, roleGuard } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/students - Owner gets all students assigned to their rooms
router.get('/', roleGuard(['owner']), (req, res) => {
  const query = `
    SELECT u.id, u.name, u.email, u.phone, r.room_number, r.hostel_name, r.id as room_id, r.created_at as enrollment_date
    FROM users u
    JOIN rooms r ON u.id = r.assigned_student_id
    WHERE r.owner_id = ?
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ students: rows });
  });
});

// PUT /api/students/:id/archive - Owner archives a student (unassigns from room)
router.put('/:id/archive', roleGuard(['owner']), (req, res) => {
  const studentId = req.params.id;
  // Unassign student from the owner's room
  db.run(
    'UPDATE rooms SET assigned_student_id = NULL, status = "available" WHERE owner_id = ? AND assigned_student_id = ?',
    [req.user.id, studentId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error archiving student' });
      if (this.changes === 0) return res.status(404).json({ message: 'Student not found in your rooms' });
      res.json({ message: 'Student archived successfully (unassigned from room)' });
    }
  );
});

module.exports = router;
