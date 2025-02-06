// const express = require("express");
// const app = express();
// require("dotenv").config();
// const indexRoutes = require("./src/routes");
// const PORT = process.env.PORT || 3000;

// // Ensure PORT is properly defined
// console.log("PORT:", PORT);

// // Middleware
// app.use(express.json());
// app.use(express.static("public"));

// // Routes
// app.use("/", (req, res) => {
//   res.send("Welcome to the homepage!");
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
const all_routes = require("./src/routes");
const bodyparser = require("body-parser");
const http = require("http");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
require("./src/config/database");

app.get("/", (req, res) => {
  res.send("Hello, Express");
});

app.use("/", all_routes);
app.listen(port, () => {
  console.log(`Server is Running at http://localhost:${port}`);
});
