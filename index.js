import express from "express";
import bodyParser from "body-parser";
import pg from "pg";   
import axios from "axios";
import "dotenv/config";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//get the books from the database by default, recent and rating & renders them on the homepage
app.get("/", async (req, res) => {
 const sort = req.query.sort;

 try {
  let query = "SELECT * FROM book_record";
  if (sort === "rating") {
      query = "SELECT * FROM book_record ORDER BY rating DESC";
  } else if (sort === "recent") {
      query = "SELECT * FROM book_record ORDER BY date_read DESC";
  }
  const result = await db.query(query);
  const allBooks = result.rows;
  res.render("index.ejs", { allBooks });
 } catch (error) {
  console.log(error);
  res.status(500).send("Could not retrieve books.");
 }
});

//Renders the add book page
app.get("/add", (req, res) => {
  res.render("add.ejs");
});

//Gets a book by its id and allows the user to edit it
app.get("/books/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await db.query("SELECT * FROM book_record WHERE id = $1", [bookId]);
    const book = result.rows[0];
    if (!book) {
      res.status(404).send("Book not found");
      return;
    }
    res.render("edit.ejs", { book });
 } catch (error) {
  console.log(error);
  res.status(500).send("Could not retrieve the book.");
 }
});

//Adds a book to the database after searching for it on Open Library and checking if it has a cover
app.post("/add", async (req, res) => {
  const { title, author, review, rating, date_read } = req.body;

  // Validate input
  if (!title || !author) {
    res.status(400).send("Title and author are required.");
    return;
  }

  if (!rating) {
    res.status(400).send("Rating is required.");
    return;
  }

  if (!date_read) {
    res.status(400).send("Date read is required.");
    return;
  }

   if (rating < 0 || rating > 10 || rating % 0.5 !== 0) {
    res.status(400).send("Rating must be a multiple of 0.5 between 0 and 10.");
    return;
  }

  try {
    // Search Open Library
    const response = await axios.get("https://openlibrary.org/search.json", {
      params: {
        title: title,
        author: author,
        fields: "key,title,author_name,editions,editions.key,editions.title,editions.cover_i",
        limit: 1
      }
    });

    // Get the first matching book
    const book = response.data.docs[0];
    if (!book) {
      throw new Error("Book not found");
    }

    // Check if the book has editions
    if (!book.editions || !book.editions.docs || book.editions.docs.length === 0) {
      throw new Error("No editions found for this book");
    }

    // Get the  edition that has a cover
    const edition = book.editions.docs.find((e) => e.cover_i);
    if (!edition) {
      throw new Error("No edition with a cover found");
    }

    // Get the edition OLID
    const olid = edition.key.replace("/books/", "");

    // Create the cover URL
    const coverUrl = `https://covers.openlibrary.org/b/olid/${olid}-M.jpg?default=false`;

    // Check if the cover exists
    await axios.get(coverUrl);

    // Save the book to PostgreSQL
    await db.query(
      `INSERT INTO book_record
      (title, author, rating, review, date_read, olid)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [response.data.docs[0].title, response.data.docs[0].author_name[0], rating, review, date_read, olid]
    );

    // Go back to the homepage
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Could not add this book. The book or its cover could not be found.");
  }
});


//Updates a book in the database by its id
app.post("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  const { review, rating, date_read } = req.body;

  try {
    const result = await db.query(
      `UPDATE book_record
      SET review = $1, rating = $2, date_read = $3
      WHERE id = $4`,
      [review, rating, date_read, bookId]
    );
    if (result.rowCount === 0) {
      res.status(404).send("Book not found");
      return;
    }
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Could not update this book.");
  }
});

//Deletes a book from the database by its id
app.post("/books/:id/delete", async (req, res) => {
  const bookId = req.params.id;
  try {
  const result = await db.query("DELETE FROM book_record WHERE id = $1", [bookId]);
  if (result.rowCount === 0) {
    res.status(404).send("Book not found");
    return;
  }
  res.redirect("/");
 } catch (error) {
  console.log(error);
  res.status(500).send("Could not delete this book.");
 }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
