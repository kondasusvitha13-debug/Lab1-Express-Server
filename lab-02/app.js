
const express = require("express");
const openDB = require("./database");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let db;

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

// GET all books
app.get("/books/", async (request, response) => {
  try {
    const books = await db.all("SELECT * FROM book");
    response.send(books);
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// GET one book by ID
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (book === undefined) {
      response.status(404).send("Book not found");
    } else {
      response.send(book);
    }
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// POST a new book
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    const result = await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?)`,
      [title, author, price, pages]
    );

    response.send({
      id: result.lastID,
      title,
      author,
      price,
      pages
    });
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

 
// PUT - Update a book
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?`,
      [title, author, price, pages, bookId]
    );

    if (result.changes === 0) {
      response.status(404).send("Book not found");
    } else {
      response.send("Book updated successfully");
    }
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

// DELETE - Delete a book
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [bookId]
    );

    if (result.changes === 0) {
      response.status(404).send("Book not found");
    } else {
      response.send("Book deleted successfully");
    }
  } catch (error) {
    response.status(500).send("Internal Server Error");
  }
});

initializeDBAndServer();

