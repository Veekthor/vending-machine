const auth = require("../middleware/auth");
const { Product } = require("../models/products");
const validateobjectId = require("../middleware/validateObjectId");
const express = require("express");
const { User } = require("../models/users");
const router = express.Router();

router.get("/", auth, async(req, res) => {
    const products = await Product.find().sort('productName');
    res.send(products);
})

router.get("/:id", auth, validateobjectId, async(req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).send({error: true, msg: "Product does not exist"})
    res.send(product);
})

router.post("/create", auth, async(req, res, next) => {
    if(req.user.role !== "seller") return res.status(401).send({error: true, msg: "User is not a seller"})
    try {
        let { productName, cost, amountAvailable, sellerId } = req.body;
        const productData = {
            productName,
            cost,
            amountAvailable,
            sellerId,
        }
        let product = new Product(productData);
        product = await product.save();
        res.send(product);
    } catch (error) {
        next(error)
    }
})

router.put("/update/:id", auth, validateobjectId, async(req, res) => {
    let product = await Product.findById(req.params.id);
    if(!product) return res.status(404).send({error: true, msg: "Product Not Found"});
    if(!req.user || req.user._id !== product.sellerId) return res.status(401).send({error: true, msg: "User is not the seller"})
    let { productName, cost, amountAvailable } = req.body;
    const productData = {
        productName,
        cost,
        amountAvailable,
    }
    product = {
        ...product,
        ...productData,
    }

    product = await product.save();
    res.send(product);
})

router.delete("/delete/:id", async(req, res) => {
    let product = await Product.findById(req.params.id);
    if(!product) return res.status(404).send({error: true, msg: "Product Not Found"});
    if(!req.user || req.user._id !== product.sellerId) return res.status(401).send({error: true, msg: "User is not the seller"})
    
    product = await Product.findOneAndDelete({_id: product._id});
    res.send(product);
})

module.exports = router;