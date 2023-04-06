const users = require("./users");
const products = require("./products");
const error = require("../middleware/error");
const swagger = require("./swagger");
const express = require("express");
module.exports = function(app) {
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use("/api/users", users);
    app.use("/api/products", products);
    app.use("/docs", swagger);

    app.use(error)
}