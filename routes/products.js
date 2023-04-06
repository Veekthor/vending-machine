const auth = require("../middleware/auth");
const { Product } = require("../models/products");
const validateobjectId = require("../middleware/validateObjectId");
const express = require("express");
const { User } = require("../models/users");
const getUser = require("../middleware/getUser");
const asyncWrap = require("../middleware/asyncWrap");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Products Management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An array of all products
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Product'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get("/", auth, async(req, res) => {
    const products = await Product.find();
    res.json(products);
});

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get product details
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       '200':
 *          description: Product details
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Product'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get("/:id", auth, validateobjectId, async(req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({error: true, message: "Product does not exist"})
    res.json(product);
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/ProductInput'
 *     responses:
 *       '201':
 *          description: Product details
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Product created successfully
 *                  product:
 *                    $ref: '#/components/schemas/Product'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.post("/", auth, getUser, async(req, res, next) => {
    if(req.fetchedUser.role !== "seller") return res.status(403).json({error: true, message: "User is not a seller"})
    try {
        let { productName, cost, amountAvailable, sellerId } = req.body;
        if(req.fetchedUser.id !== sellerId) return res.status(403).json({ error: true, message: "Provide correct sellerId"})
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
});

/**
 * @swagger
 * /api/products/{productId}:
 *   put:
 *     summary: Update Product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       $ref: '#/components/requestBodies/ProductInput'
 *     responses:
 *       '200':
 *          description: Product details
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Product Updated successfully
 *                  product:
 *                    $ref: '#/components/schemas/Product'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.put("/:id", auth, validateobjectId, asyncWrap(async(req, res) => {
  let product = await Product.findById(req.params.id);
  if(!product) return res.status(404).json({error: true, message: "Product Not Found"});
  if(!req.user || req.user.id !== product.sellerId.toString()) return res.status(401).json({error: true, message: "Product can only be updated by the seller"});
  
  let { productName, cost, amountAvailable } = req.body;
  if(productName) product.productName = productName;
  if(cost) product.cost = cost;
  if(amountAvailable) product.amountAvailable = amountAvailable;
  await product.save();
  res.json({ message: "Product Updated successfully", product });
}));

/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     summary: Delete Product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       '200':
 *          description: Product details
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Product deleted Successfully
 *                  product:
 *                    $ref: '#/components/schemas/Product'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.delete("/:id", auth, asyncWrap(async(req, res) => {
    let product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({error: true, message: "Product Not Found"});
    if(!req.user || req.user.id !== product.sellerId.toString()) return res.status(401).json({error: true, message: "User is not the seller"})
    
    product = await Product.findOneAndDelete({_id: product._id});
    res.json({ message: "Product deleted Successfully", product });
}));

/**
 * @swagger
 * /api/products/buy:
 *   post:
 *     summary: Buy Product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              productId:
 *                type: string
 *                description: ID of product to be bought
 *                example: 642d06b643f6f447711afd06
 *              amount:
 *                type: number
 *                description: Number of products to buy
 *                example: 23
 *     responses:
 *       '200':
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Purchase successful
 *                  totalSpent:
 *                    type: number
 *                    example: 25
 *                  change:
 *                    type: number
 *                    example: 25
 *                  product:
 *                    $ref: '#/components/schemas/Product'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.post('/buy', auth, getUser, async (req, res) => {
    try {
      const { productId, amount } = req.body;
      if(!productId || !amount) return res.status(400).json({error: true, message: "productId and amount are required"})
  
      const product = await Product.findById(productId);
      if(!product) return res.status(404).send({ error: true, message: "Product not found"});
      if(product.amountAvailable < amount) return res.status(400)
        .json({ error: true, message: 'Amount of product available is less than requested'});
      const totalCost = product.cost * amount;
  
      const user = req.fetchedUser;
  
      if (user.deposit < totalCost) {
        return res.status(400).json({ error: true, message: 'Insufficient balance' });
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
      res.status(500).json({ error: err.message});
    }
  });

module.exports = router;