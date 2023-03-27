const mongoose = require("mongoose");

module.exports = function(){
    const db = process.env.DB_PATH;
    mongoose.connect(db)
    .then(() => console.log("Connected to DB"));
}