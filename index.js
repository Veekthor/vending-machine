require("dotenv").config();
const helmet = require("helmet");
const express = require("express");
const app = express();

require("./routes")(app);
require("./db")();

app.get("/", (req, res) => {
  res.redirect("/docs");
});

app.get("/api/health", (req, res) => {
  res.json({
    health: "OK",
  });
});

if (process.env.NODE_ENV === "production") app.use(helmet());

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

module.exports = server;
