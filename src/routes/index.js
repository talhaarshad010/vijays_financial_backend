const express = require("express");
const rootrouter = express.Router();
const user = require("./user_route/user.route");
rootrouter.use("/user", user);
module.exports = rootrouter;
