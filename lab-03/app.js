
const express = require("express");
const openDB = require("./database");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let db;

// Initialize Database and Server
async function initializeDBAndServer() {
  try {
    db = await openDB();

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      )
    `);

    const result = await db.get(
      "SELECT COUNT(*) AS count FROM book"
    );

    if (result.count === 0) {
      const books = [
        ["Wings of Fire", "A.P.J. Abdul Kalam", 250, 200],
        ["The Alchemist", "Paulo Coelho", 300, 208],
        ["Harry Potter", "J.K. Rowling", 400, 350],
        ["Atomic Habits", "James Clear", 350, 320],
        ["Rich Dad Poor Dad", "Robert Kiyosaki", 280, 240],
        ["Ikigai", "Hector Garcia", 220, 180],
        ["The Hobbit", "J.R.R. Tolkien", 320, 310],
        ["Think and Grow Rich", "Napoleon Hill", 260, 250]
      ];

      for (const book of books) {
        await db.run(
          `INSERT INTO book (title, author, price, pages)
           VALUES (?, ?, ?, ?)`,
          book
        );
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
}

// GET all books with search, sorting, pagination and price filtering
app.get("/books", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price
    } = request.query;

    // Validate sorting column
    const allowedColumns = ["id", "title", "author", "price", "pages"];

    if (!allowedColumns.includes(order_by)) {
      return response.status(400).json({
        message: "Invalid order_by value"
      });
    }

    // Validate sorting order
    const sortOrder = order.toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return response.status(400).json({
        message: "Order must be ASC or DESC"
      });
    }

    // Validate limit and offset
    const pageLimit = Number(limit);
    const pageOffset = Number(offset);

    if (
      !Number.isInteger(pageLimit) ||
      pageLimit <= 0 ||
      !Number.isInteger(pageOffset) ||
      pageOffset < 0
    ) {
      return response.status(400).json({
        message: "Limit must be positive and offset must be non-negative"
      });
    }

    // Build parameterised filters
    let query = "SELECT * FROM book WHERE 1 = 1";
    const params = [];

    if (search_q.trim() !== "") {
      query += " AND title LIKE ?";
      params.push(`%${search_q}%`);
    }

    if (min_price !== undefined) {
      const min = Number(min_price);

      if (!Number.isFinite(min)) {
        return response.status(400).json({
          message: "min_price must be a number"
        });
      }

      query += " AND price >= ?";
      params.push(min);
    }

    if (max_price !== undefined) {
      const max = Number(max_price);

      if (!Number.isFinite(max)) {
        return response.status(400).json({
          message: "max_price must be a number"
        });
      }

      query += " AND price <= ?";
      params.push(max);
    }

    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return response.status(400).json({
        message: "min_price cannot be greater than max_price"
      });
    }

    // Sorting and pagination
    query += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(pageLimit, pageOffset);

    const books = await db.all(query, params);

    response.status(200).json(books);

  } catch (error) {
    response.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// GET a single book by ID
app.get("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (!book) {
      return response.status(404).json({
        message: "Book not found"
      });
    }

    response.status(200).json(book);

  } catch (error) {
    response.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// POST a new book with validation
app.post("/books", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      typeof price !== "number" ||
      !Number.isFinite(price)
    ) {
      return response.status(400).json({
        message: "Title, author and a numeric price are required"
      });
    }

    const result = await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?)`,
      [title.trim(), author.trim(), price, pages ?? null]
    );

    response.status(201).json({
      message: "Book created successfully",
      book: {
        id: result.lastID,
        title: title.trim(),
        author: author.trim(),
        price,
        pages: pages ?? null
      }
    });

  } catch (error) {
    response.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// PUT - Update a book
app.put("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      typeof price !== "number" ||
      !Number.isFinite(price)
    ) {
      return response.status(400).json({
        message: "Title, author and a numeric price are required"
      });
    }

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?`,
      [title.trim(), author.trim(), price, pages ?? null, bookId]
    );

    if (result.changes === 0) {
      return response.status(404).json({
        message: "Book not found"
      });
    }

    response.status(200).json({
      message: "Book updated successfully"
    });

  } catch (error) {
    response.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// DELETE - Delete a book
app.delete("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;

    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [bookId]
    );

    if (result.changes === 0) {
      return response.status(404).json({
        message: "Book not found"
      });
    }

    response.status(200).json({
      message: "Book deleted successfully"
    });

  } catch (error) {
    response.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// Start the application
initializeDBAndServer();

module.exports = app;
