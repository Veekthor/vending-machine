const express = require("express");
const { User } = require("../models/users");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const getUser = require("../middleware/getUser");
const asyncWrap = require("../middleware/asyncWrap");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management
 */

/**
 * @swagger
 * components:
 *  responses:
 *      ExistingUserError:
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              error:
 *                type: boolean
 *              message:
 *                type: string
 *            example:
 *              error: true
 *              message: User already exists
 */

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/UserResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get("/:id", auth, validateObjectId, getUser, async (req, res) => {
    const fetchedUser = req.fetchedUser;
    if(req.user.id !== fetchedUser.id) return res.status(403).json({error: true, message: "Cannot fetch another user's data"})
    let {password: _, ...user} = fetchedUser.toObject();
    res.json(user);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     requestBody:
 *       $ref: '#/components/requestBodies/UserInput'
 *     responses:
 *       '201':
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  example: "fakeToken"
 *                message:
 *                  type: string
 *                  example: "User Created successfully"
 *                user:
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                      example: test123
 *                    deposit: 
 *                      type: integer
 *                      example: 300
 *                    role: 
 *                      type: string
 *                      example: seller
 *              
 *       '400':
 *         $ref: '#/components/responses/ExistingUserError'
 */

router.post("/", async (req, res, next) => {
    try{
        let user = await User.findOne({ username: req.body.username});
        if(user) return res.status(400).json({
            error: true,
            message: "User already exists",
        });
    
        const userData = {
            username: req.body.username,
            password: req.body.password,
            role: req.body.role,
        }
    
        user = new User(userData);
    
        await user.save();
    
        const token = user.generateAuthToken();
        let {password: _, ...returnedUser} = user.toObject();
        res.status(201).json({
            message: "User Created successfully",
            token,
            user: returnedUser,
        });
    } catch(err) {
        next(err)
    }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update user's details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            required:
 *              - username
 *              - role
 *            properties:
 *              username:
 *                type: string
 *                minlength: 5
 *                maxlength: 20
 *                description: Username
 *                example: test123
 *              role:
 *                type: string
 *                enum: [buyer, seller]
 *                default: buyer
 *                description: User's role
 *                example: seller
 *     responses:
 *       '200':
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Updated Successfully OR Nothing to update"
 *                user:
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                      example: test123
 *                    deposit: 
 *                      type: integer
 *                      example: 300
 *                    role: 
 *                      type: string
 *                      example: seller
 *              
 *       '400':
 *         $ref: '#/components/responses/ExistingUserError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.put("/:id", auth, validateObjectId, getUser, asyncWrap(async (req, res) => {
    let user = req.fetchedUser;
    let updated = false;
    if(req.user.id !== user.id) return res.status(403).json({error: true, message: "Cannot update another user's data"});
    let { username, role } = req.body;
    if(username) {
        if(await User.isUsernameUnique(username)){
            user.username = username;
            updated = true;
        } else {
            return res.status(400).json({error: true, message: "username is already in use"})
        }
    }
    if(role){
        user.role = role;
        updated = true;
    }

    await user.save();
    return res.json({
        message: updated ? "Updated Successfully" : "Nothing to update",
        user,
    })
}));

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete User
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       '200':
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "User deleted successfully"
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Cannot delete another user's data"
 *                error:
 *                  type: boolean
 *                  example: true
 */

router.delete('/:id', auth, getUser, async (req, res) => {
    try {
        let user = req.fetchedUser;
        if(req.user.id !== user.id) return res.status(403).json({error: true, message: "Cannot delete another user's data"});
        await User.deleteOne({_id: req.user.id});
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/users/deposit:
 *   post:
 *     summary: Deposit coin into user's account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            required:
 *              - coin
 *            properties:
 *              coin:
 *                type: integer
 *                enum: [5, 10, 20, 50, 100]
 *                example: 50
 *     responses:
 *       '200':
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Deposited 50 cents into account"
 *                data:
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                      example: test123
 *                    deposit: 
 *                      type: integer
 *                      example: 300
 *                    role: 
 *                      type: string
 *                      example: buyer
 *              
 *       '400':
 *         $ref: '#/components/responses/ExistingUserError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.post("/deposit", auth, getUser, async(req, res) => {
    let user = req.fetchedUser;
    if(user.role !== "buyer") return res.status(403).json({error:true, message: 'User is not a buyer'})
    const coin = req.body.coin;
    if (![5, 10, 20, 50, 100].includes(coin)) {
      return res.status(400).json({ message: 'Invalid coin' });
    }

    user.deposit += coin;
    await user.save();
    res.json({ message: `Deposited ${coin} cents into account`, data: user });
});

/**
 * @swagger
 * /api/users/resetDeposit:
 *   post:
 *     summary: Reset user's deposit to 0
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Deposit reset successful."
 *                data:
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                      example: test123
 *                    deposit: 
 *                      type: integer
 *                      example: 300
 *                    role: 
 *                      type: string
 *                      example: buyer
 *              
 *       '400':
 *         $ref: '#/components/responses/ExistingUserError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.post('/resetDeposit', auth, getUser, async (req, res, next) => {
    const { id: userId } = req.user; 
    
    try {
      const user = await User.findById(userId);
      user.deposit = 0;
      await user.save();
      
      res.json({
        message: 'Deposit reset successful.',
        data: user
      });
    } catch (err) {
      console.error(err);
      next(err)
    }
});

module.exports = router;