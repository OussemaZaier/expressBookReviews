const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const reviewerUsername = req.session.authorization.username;
    const review = req.body.review;
    books[isbn].reviews[reviewerUsername] = review;
    return res.status(200).json({
      message: "Review added successfully!",
      user: reviewerUsername,
      book: books[isbn],
    });
  }

  return res
    .status(404)
    .json({ message: `book with this isbn: ${isbn} does not exixst !` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const reviewerUsername = req.session.authorization["username"];
    delete books[isbn].reviews[reviewerUsername];

    return res.json({
      message: `Review has been deleted successfully!`,
      currentUser: reviewerUsername,
      bookDetails: { isbn: isbn, ...books[isbn] },
    });
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found!` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
