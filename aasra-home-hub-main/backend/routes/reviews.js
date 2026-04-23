const express = require('express');
const db = require('../db');
const { authenticateToken, roleGuard } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews - Get reviews per hostel (Public)
router.get('/', (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ reviews: rows });
  });
});

// GET /api/reviews/hostel/:hostelName - Get stats for a specific hostel (Public)
router.get('/hostel/:hostelName', (req, res) => {
  const { hostelName } = req.params;
  db.get('SELECT AVG(rating) as avgRating, COUNT(id) as totalReviews FROM reviews WHERE hostel_name = ?', [hostelName], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ stats: row });
  });
});

// POST /api/reviews - Submit review (Student)
router.post('/', authenticateToken, roleGuard(['student']), (req, res) => {
  const { hostelName, rating, reviewText } = req.body;
  if (!hostelName || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Valid rating required' });
  }

  db.run(
    'INSERT INTO reviews (student_id, hostel_name, rating, review_text) VALUES (?, ?, ?, ?)',
    [req.user.id, hostelName, rating, reviewText],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error submitting review' });
      res.status(201).json({ message: 'Review submitted successfully' });
    }
  );
});

module.exports = router;
