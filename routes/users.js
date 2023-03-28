const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");
const router = express.Router();

router.get("/", (req, res) => {res.send({health: "ok"})})

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
    
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    
        await user.save();
    
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send({
            _id: user._id,
            username: user.username,
            role: user.role
        });
    } catch(err) {
        next(err)
    }
})

module.exports = router;