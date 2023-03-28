const auth = require("../middleware/auth");
const { Product } = require("../models/products");
const validateobjectId = require("../middleware/validateObjectId");
const express = require("express");
const router = express.Router();

router.get("/", auth, async(req, res) => {
    const products = await Product.find();
    res.json(products);
})

router.get("/:id", auth, validateobjectId, async(req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({error: true, message: "Product does not exist"})
    res.json(product);
})

router.post("/", auth, async(req, res, next) => {
    if(req.user.role !== "seller") return res.status(403).json({error: true, message: "User is not a seller"})
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
        res.status(201).json({ message: "Product created successfully", product});
    } catch (error) {
        next(error)
    }
})

router.put("/:id", auth, validateobjectId, async(req, res) => {
    let product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({error: true, message: "Product Not Found"});
    if(!req.user || req.user.id !== product.sellerId) return res.status(401).json({error: true, message: "Product can only be updated by the seller"});
    
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

router.delete("/:id", async(req, res) => {
    let product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({error: true, message: "Product Not Found"});
    if(!req.user || req.user._id !== product.sellerId) return res.status(401).json({error: true, message: "User is not the seller"})
    
    product = await Product.findOneAndDelete({_id: product._id});
    res.json(product);
})

module.exports = router;