const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", (req, res) => {res.send({health: "ok"})})

router.get("/:id", auth, validateObjectId, async (req, res) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        res.status(400)
        .send('User with given ID does not exist');

        return;
    };
    res.send(user);
});

router.post("/create", async (req, res, next) => {
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

router.put("/update/:id", auth, validateObjectId, async (req, res) => {
    let user = await User.findById(req.params.id);
    if(!user) {
        res.status(400)
        .send('User with given ID does not exist');

        return;
    };
    console.log(req.user)
    if(req.user.username !== user.username) return res.status(401).send({error: true, msg: "Unauthorised"});
    const userData = {
        username: req.body.username,
        role: req.body.role,
        deposit: req.body.deposit,
    }

    user = {
        ...user,
        ...userData,
    }

    await user.save();
    return res.send(user);
})

router.delete("/delete/:id", auth, validateObjectId, async (req, res) => {
    let user = await User.findById(req.params.id);
    if(!user) {
        res.status(400).send({error: true, msg:'User with given ID does not exist'});
        return;
    };
    console.log(req.user)

    user = await User.findByIdAndDelete(req.params.id);
    delete user.password;
    res.send(user);
})

module.exports = router;