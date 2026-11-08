
# Lab 3: REST API, Query Parameters, Validation, Debugging

## Student Details
- Name: G. Meghana
- Registration Number: 252U1R9040
- Section: CSE GEN AI 2A(304)

## Live Link
Not deployed yet.

## Project Description
This project implements a REST API for managing books using Node.js, Express.js and SQLite.

## Technologies Used
- Node.js
- Express.js
- SQLite
- Postman

## Installation

Install the required packages:

```bash
npm install
```

## How to Run

Start the server:

```bash
node server.js
```

Server URL:

http://localhost:3000/

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /books/ | Get all books with search, sorting and filtering |
| GET | /books/:bookId/ | Get a particular book |
| POST | /books/ | Add a new book |
| PUT | /books/:bookId/ | Update a book |
| DELETE | /books/:bookId/ | Delete a book |

## Query Parameters

- search_q: Search books by title.
- order_by: Sort by id, title, author or price.
- order: ASC or DESC.
- limit: Number of records.
- offset: Number of records to skip.
- min_price: Minimum book price.
- max_price: Maximum book price.

## Validation and Status Codes

- 200: Successful GET, PUT and DELETE.
- 201: Book created successfully.
- 400: Invalid input or query parameters.
- 404: Book not found.
- 500: Server error.

## Screenshots

Add Postman screenshots in the screenshots folder.

## Problems Faced and Solutions

- Fixed npm command execution issues in PowerShell.
- Configured Express and SQLite.
- Tested REST API endpoints using Postman.
- Implemented search, sorting, pagination and price filtering.
- Tested input validation and error handling.
