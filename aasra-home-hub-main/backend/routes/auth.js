const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, roleGuard } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = 'your_super_secret_jwt_key_here_change_in_production';

// Sign Up
router.post('/signup', async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const userRole = role === 'owner' ? 'owner' : 'student';

      // Insert user
      db.run('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', 
        [name, email, phone || null, hashedPassword, userRole],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error creating user' });
          }
          
          const token = jwt.sign(
            { id: this.lastID, email, name, role: userRole },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.status(201).json({ 
            message: 'User created successfully',
            token,
            user: { id: this.lastID, name, email, phone: phone || null, role: userRole }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Log In
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    try {
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Logged in successfully',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });

    } catch (error) {
      res.status(500).json({ message: 'Server error during login' });
    }
  });
});

// GET /me
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, phone, role, last_profile_edit FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  });
});

// PUT /profile
router.put('/profile', authenticateToken, (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ message: 'Nothing to update' });

  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check 14 days rule
    if (user.last_profile_edit) {
      const lastEdit = new Date(user.last_profile_edit);
      const now = new Date();
      const diffTime = Math.abs(now - lastEdit);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays < 14) {
        return res.status(429).json({ message: `Profile can only be edited once every 14 days. Try again in ${14 - diffDays} days.` });
      }
    }

    // Save history
    db.run('INSERT INTO profile_history (user_id, email, phone) VALUES (?, ?, ?)',
      [user.id, user.email, user.phone],
      (err) => {
        if (err) return res.status(500).json({ message: 'Database error saving history' });
        
        // Update user
        const newEmail = email || user.email;
        const newPhone = phone || user.phone;
        
        db.run('UPDATE users SET email = ?, phone = ?, last_profile_edit = CURRENT_TIMESTAMP WHERE id = ?',
          [newEmail, newPhone, user.id],
          function(err) {
            if (err) return res.status(500).json({ message: 'Error updating profile. Email might be in use.' });
            res.json({ message: 'Profile updated successfully', user: { ...user, email: newEmail, phone: newPhone, last_profile_edit: new Date().toISOString() } });
          }
        );
      }
    );
  });
});

// GET /profile-history/:userId (owner only)
router.get('/profile-history/:userId', authenticateToken, roleGuard(['owner']), (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM profile_history WHERE user_id = ? ORDER BY changed_at DESC LIMIT 10', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ history: rows });
  });
});

module.exports = router;
