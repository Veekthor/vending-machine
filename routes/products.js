const auth = require("../middleware/auth");
const { Product } = require("../models/products");
const validateobjectId = require("../middleware/validateObjectId");
const express = require("express");
const { User } = require("../models/users");
const getUser = require("../middleware/getUser");
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

router.post('/buy', auth, getUser, async (req, res) => {
    try {
      const { productId, amount } = req.body;
      if(!productId || !amount) return res.status(400).json({error: true, message: "productId and amount are required"})
  
      const product = await Product.findById(productId);
  
      const totalCost = product.cost * amount;
  
      const user = req.fetchedUser;
  
      if (user.deposit < totalCost) {
        return res.status(400).json({ error: 'Insufficient deposit' });
      }
  
      product.amountAvailable -= amount;
      await product.save();
  
      const change = user.deposit - totalCost;
  
      let changeInCoins = [0, 0, 0, 0, 0];
      let remainingChange = change;
      while (remainingChange > 0) {
        if (remainingChange >= 100) {
          changeInCoins[4]++;
          remainingChange -= 100;
        } else if (remainingChange >= 50) {
          changeInCoins[3]++;
          remainingChange -= 50;
        } else if (remainingChange >= 20) {
          changeInCoins[2]++;
          remainingChange -= 20;
        } else if (remainingChange >= 10) {
          changeInCoins[1]++;
          remainingChange -= 10;
        } else {
          changeInCoins[0]++;
          remainingChange -= 5;
        }
      }
  
      user.deposit = change;
      await user.save();
  
      res.json({
        message: 'Purchase successful',
        totalSpent: totalCost,
        product,
        change: changeInCoins
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;