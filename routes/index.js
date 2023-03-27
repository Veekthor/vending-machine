const users = require("./users");
const error = require("../middleware/error");
const express = require("express");
module.exports = function(app) {
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use("/api/users", users);

    app.use(error)
}