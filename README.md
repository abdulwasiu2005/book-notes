# Book Notes

A full-stack book notes application built with Node.js, Express, EJS, and PostgreSQL. The application allows users to keep track of books they have read, write personal reviews, rate books, record the date they read them, and manage their collection.

Book information and cover images are retrieved from the Open Library API when a new book is added.

## Features

* Add books to a personal book collection
* Search for books using the Open Library API
* Automatically retrieve a book edition with an available cover
* Store the Open Library edition ID (OLID) for each book
* Write and edit personal reviews/notes
* Rate books from 0 to 10 in 0.5-point increments
* Record the date a book was read
* View saved books and their cover images
* Edit existing book reviews, ratings, and dates
* Delete books from the collection
* Sort books by rating
* Sort books by most recent date read
* Responsive layout for desktop and mobile screens

## Technologies Used

* HTML
* CSS
* JavaScript
* Node.js
* Express.js
* EJS
* PostgreSQL
* Axios
* Open Library API
* Git
* GitHub

## Database

The application uses a PostgreSQL database with a `book_record` table.

| Column | Data Type | Description |
|---|---|---|
| `id` | INTEGER | Primary key |
| `title` | VARCHAR(100) | Book title |
| `author` | VARCHAR(100) | Book author |
| `rating` | NUMERIC | Personal rating from 0 to 10, in 0.5 increments |
| `review` | TEXT | Personal review/notes |
| `date_read` | DATE | Date the book was read |
| `olid` | TEXT | Open Library edition identifier |

### Database Constraints

- `id` is the primary key.
- `rating` must be between 0 and 10.
- `rating` must be in increments of 0.5.

The application also validates required fields before inserting a book.

## Project Structure

```text
book-notes/
├── public/
│   └── css/
│       └── style.css
├── views/
│   ├── index.ejs
│   ├── add.ejs
│   └── edit.ejs
├── .env
├── .gitignore
├── index.js
├── package.json
└── package-lock.json
```

> The `.env` file is not included in the GitHub repository. It contains local database credentials and is excluded through `.gitignore`.

## Database

The application uses PostgreSQL with a `book_record` table.

| Column      | Description                            |
| ----------- | -------------------------------------- |
| `id`        | Unique identifier for each book record |
| `title`     | Book title                             |
| `author`    | Book author                            |
| `rating`    | Personal rating from 0 to 10           |
| `review`    | Personal review or notes               |
| `date_read` | Date the book was read                 |
| `olid`      | Open Library edition identifier        |

The rating column accepts values between 0 and 10 in 0.5-point increments.

## Open Library Integration

When a user adds a book, the application sends a search request to the Open Library API using the submitted title and author.

The application then:

1. Finds the first matching book.
2. Checks whether editions are available.
3. Finds an edition with a cover.
4. Extracts the edition's Open Library ID (OLID).
5. Checks that the corresponding cover exists.
6. Stores the book information and OLID in PostgreSQL.
7. Uses the stored OLID to display the cover on the application.

Cover images are retrieved using the Open Library Covers service.

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd book-notes
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL

Create a PostgreSQL database and create the `book_record` table with the required columns.

### 4. Create the environment file

Create a `.env` file in the root directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=book_notes
DB_PASSWORD=your_password
DB_PORT=5432
```

Replace the values with your own PostgreSQL configuration.

**Do not commit the `.env` file to GitHub.**

### 5. Start the application

```bash
node index.js
```

The application runs on:

```text
http://localhost:3000
```

## Database Security

Database credentials are stored in environment variables rather than directly in the source code.

The `.env` file is excluded from version control using `.gitignore` to prevent credentials from being uploaded to GitHub.

## Main Routes

| Method | Route               | Purpose                          |
| ------ | ------------------- | -------------------------------- |
| `GET`  | `/`                 | Display all saved books          |
| `GET`  | `/add`              | Display the add-book form        |
| `POST` | `/add`              | Add a new book                   |
| `GET`  | `/books/:id`        | Display the edit form for a book |
| `POST` | `/books/:id`        | Update a book                    |
| `POST` | `/books/:id/delete` | Delete a book                    |

Sorting is handled through query parameters:

```text
/?sort=rating
/?sort=recent
```

## Error Handling

The application includes handling for common errors such as:

* Missing required book information
* Missing rating
* Missing date read
* Invalid ratings
* Books that cannot be found through Open Library
* Books without available editions
* Editions without covers
* Books that do not exist in the database
* Database errors during retrieval, insertion, updating, or deletion

## Future Improvements

Possible future improvements could include:

* User accounts and authentication
* Multiple users with separate book collections
* Additional sorting and filtering options
* Search within the user's saved books
* Pagination for larger collections
* Improved error pages

## Author

Developed as a web development capstone project using Node.js, Express, PostgreSQL, EJS, and the Open Library API.
