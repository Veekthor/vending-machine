const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const getUser = require("../middleware/getUser");
const router = express.Router();

router.get("/:id", auth, validateObjectId, async (req, res) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        res.status(400)
        .send('User with given ID does not exist');

        return;
    };
    res.send(user);
});

router.post("/", async (req, res, next) => {
    try{
        let user = await User.findOne({ username: req.body.username});
        if(user) return res.status(400).send({
            error: true,
            msg: "User already exists",
        });
    
        const userData = {
            username: req.body.username,
            password: req.body.password,
            role: req.body.role,
        }
        if(req.body.deposit) userData.deposit = req.body.deposit;
    
        user = new User(userData);
        console.log(user.validateSync());
    
        await user.save();
    
        const token = user.generateAuthToken();
        res.status(201).json({
            message: "User Created successfully",
            token,
        });
    } catch(err) {
        next(err)
    }
})

router.put("/update/:id", auth, validateObjectId, getUser, async (req, res) => {
    let user = req.fetchedUser;
    if(req.user.username !== user.username) return res.status(401).send({error: true, msg: "Unauthorised"});
    const userData = {
        username: req.body.username,
        role: req.body.role,
    }

    user = {
        ...user,
        ...userData,
    }

    await user.save();
    return res.send(user);
})

router.delete('/:id', auth, getUser, async (req, res) => {
    try {
      await req.fetchedUser.remove();
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.post("/deposit", auth, getUser, async(req, res) => {
    let user = req.fetchedUser;
    if(user.role !== "buyer") return res.status(403).send({error:true, message: 'User is not a buyer'})
    const coin = req.body.coin;
    if (![5, 10, 20, 50, 100].includes(coin)) {
      return res.status(400).json({ message: 'Invalid coin' });
    }

    user.deposit += coin;
    user = await user.save();
    res.json({ message: `Deposited ${coin} cents into account` });
})

module.exports = router;