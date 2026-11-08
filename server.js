
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());

let db;

// Initialize database
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: './books.db',
            driver: sqlite3.Database,
        });

        await db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL
      );
    `);

        app.listen(3000, () => {
            console.log('Server Running at http://localhost:3000/');
        });
    } catch (error) {
        console.log(`Database Error: ${error.message}`);
        process.exit(1);
    }
};

// Root route
app.get('/', (req, res) => {
    res.send('Server is running! Access the API at <a href="/books/">/books/</a>');
});

// GET all books with search, sorting and filters
app.get('/books/', async (req, res) => {
    app.get('/', (req, res) => {
        res.send('Server is running! Go to /books to view the books API.');
    });
    try {
        const {
            search_q = '',
            order_by = 'title',
            order = 'ASC',
            limit = '10',
            offset = '0',
            min_price,
            max_price,
        } = req.query;

        const allowedColumns = ['id', 'title', 'author', 'price'];
        const sortOrder = order.toUpperCase();

        if (!allowedColumns.includes(order_by) ||
            !['ASC', 'DESC'].includes(sortOrder)) {
            return res.status(400).json({ message: 'Invalid sorting parameters' });
        }

        const limitValue = Number(limit);
        const offsetValue = Number(offset);

        if (!Number.isInteger(limitValue) || limitValue <= 0 ||
            !Number.isInteger(offsetValue) || offsetValue < 0) {
            return res.status(400).json({ message: 'Invalid limit or offset' });
        }

        let query = 'SELECT * FROM books WHERE title LIKE ?';
        const params = [`%${search_q}%`];

        if (min_price !== undefined) {
            const min = Number(min_price);
            if (!Number.isFinite(min)) {
                return res.status(400).json({ message: 'Invalid minimum price' });
            }
            query += ' AND price >= ?';
            params.push(min);
        }

        if (max_price !== undefined) {
            const max = Number(max_price);
            if (!Number.isFinite(max)) {
                return res.status(400).json({ message: 'Invalid maximum price' });
            }
            query += ' AND price <= ?';
            params.push(max);
        }

        if (min_price !== undefined && max_price !== undefined &&
            Number(min_price) > Number(max_price)) {
            return res.status(400).json({ message: 'Minimum price cannot exceed maximum price' });
        }

        query += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limitValue, offsetValue);

        const books = await db.all(query, params);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET one book
app.get('/books/:bookId/', async (req, res) => {
    try {
        const { bookId } = req.params;
        const book = await db.get(
            'SELECT * FROM books WHERE id = ?',
            [bookId]
        );

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new book
app.post('/books/', async (req, res) => {
    try {
        const { title, author, price } = req.body;

        if (typeof title !== 'string' || title.trim() === '' ||
            typeof author !== 'string' || author.trim() === '' ||
            price === undefined || price === null ||
            typeof price !== 'number' || !Number.isFinite(price)) {
            return res.status(400).json({
                message: 'Title, author and numeric price are required',
            });
        }

        const result = await db.run(
            'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
            [title.trim(), author.trim(), price]
        );

        res.status(201).json({
            message: 'Book added successfully',
            bookId: result.lastID,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update a book
app.put('/books/:bookId/', async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, author, price } = req.body;

        if (typeof title !== 'string' || title.trim() === '' ||
            typeof author !== 'string' || author.trim() === '' ||
            price === undefined || price === null ||
            typeof price !== 'number' || !Number.isFinite(price)) {
            return res.status(400).json({
                message: 'Title, author and numeric price are required',
            });
        }

        const result = await db.run(
            `UPDATE books
       SET title = ?, author = ?, price = ?
       WHERE id = ?`,
            [title.trim(), author.trim(), price, bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE a book
app.delete('/books/:bookId/', async (req, res) => {
    try {
        const { bookId } = req.params;

        const result = await db.run(
            'DELETE FROM books WHERE id = ?',
            [bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

initializeDBAndServer();

module.exports = app;

