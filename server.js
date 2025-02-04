const express = require("express");
const app = express();
require("dotenv").config();
const indexRoutes = require("./src/routes");
const PORT = process.env.PORT || 3000;

// Ensure PORT is properly defined
console.log("PORT:", PORT);

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
