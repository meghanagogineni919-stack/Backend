const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

let db;

// Connect to SQLite database and ensure the table exists
async function initializeDB() {
  db = await open({
    filename: path.join(__dirname, 'books.db'),
    driver: sqlite3.Database
  });

  // Create books table if it doesn't already exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER
    )
  `);

  console.log('Connected to SQLite database (books.db) and ensured "books" table exists.');
}

// ================= CRUD ROUTES =================

// 1. GET /books - Retrieve all books
app.get('/books', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM books');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /books/:id - Retrieve a single book by ID
app.get('/books/:id', async (req, res) => {
  try {
    const book = await db.get('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /books - Add a new book
app.post('/books', async (req, res) => {
  try {
    const { title, author, year } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and Author are required' });
    }

    const result = await db.run(
      'INSERT INTO books (title, author, year) VALUES (?, ?, ?)',
      [title, author, year || null]
    );

    res.status(201).json({
      message: 'Book added successfully',
      id: result.lastID,
      title,
      author,
      year: year || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT /books/:id - Update an existing book
app.put('/books/:id', async (req, res) => {
  try {
    const { title, author, year } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and Author are required' });
    }

    const result = await db.run(
      'UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?',
      [title, author, year || null, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE /books/:id - Delete a book by ID
app.delete('/books/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM books WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server after database initialization
initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });
