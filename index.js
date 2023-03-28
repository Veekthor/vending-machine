require("dotenv").config();
const express = require("express");
const app = express();

require("./routes")(app);
require("./db")();
app.get("/", (req, res) => {
    res.json({
        health: "OK"
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
})