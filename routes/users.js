const express = require("express");
const { User } = require("../models/users");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const getUser = require("../middleware/getUser");
const asyncWrap = require("../middleware/asyncWrap");
const router = express.Router();

router.get("/:id", auth, validateObjectId, getUser, async (req, res) => {
    const fetchedUser = req.fetchedUser.toObject();
    if(req.user.id !== fetchedUser.id) return res.status(403).json({error: true, message: "Cannot fetch another user's data"})
    let {password: _, ...user} = fetchedUser;
    res.json(user);
});

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
})

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
}))

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

router.post('/resetDeposit', auth, async (req, res, next) => {
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