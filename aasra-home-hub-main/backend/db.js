const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.run('PRAGMA foreign_keys = ON');

    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      last_profile_edit DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating users table', err.message);
    });

    // Create rooms table
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostel_name TEXT NOT NULL,
      room_number TEXT NOT NULL,
      room_type TEXT NOT NULL DEFAULT 'Single',
      capacity INTEGER NOT NULL DEFAULT 1,
      rate REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      owner_id INTEGER REFERENCES users(id),
      assigned_student_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating rooms table', err.message);
      else {
        // Seed dummy rooms if empty
        db.get('SELECT COUNT(*) as count FROM rooms', [], (err, row) => {
          if (row.count === 0) {
            const dummyRooms = [
              { hostel_name: "Sunrise Boys Hostel", room_number: "A-101", room_type: "Single", capacity: 1, rate: 5000 },
              { hostel_name: "Sunrise Boys Hostel", room_number: "B-204", room_type: "Double", capacity: 2, rate: 3500 },
              { hostel_name: "Green Valley Hostel", room_number: "C-302", room_type: "Triple", capacity: 3, rate: 2500 },
              { hostel_name: "Green Valley Hostel", room_number: "A-105", room_type: "Single", capacity: 1, rate: 6000 },
              { hostel_name: "City Stay Hostel", room_number: "D-110", room_type: "Double", capacity: 2, rate: 4000 },
              { hostel_name: "City Stay Hostel", room_number: "D-112", room_type: "Single", capacity: 1, rate: 5500 },
            ];
            
            const insert = db.prepare('INSERT INTO rooms (hostel_name, room_number, room_type, capacity, rate) VALUES (?, ?, ?, ?, ?)');
            dummyRooms.forEach(r => insert.run(r.hostel_name, r.room_number, r.room_type, r.capacity, r.rate));
            insert.finalize();
            console.log('Seeded dummy rooms into the database.');
          }
        });
      }
    });

    // Create payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      month TEXT,
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      receipt_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating payments table', err.message);
    });

    // Create messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      hostel_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating messages table', err.message);
    });

    // Create profile_history table
    db.run(`CREATE TABLE IF NOT EXISTS profile_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      email TEXT,
      phone TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating messages table', err.message);
    });

    // Create complaints table (FR-07)
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id),
      hostel_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating complaints table', err.message);
    });

    // Create reviews table (FR-08)
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id),
      hostel_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('Error creating reviews table', err.message);
    });
  }
});

module.exports = db;
