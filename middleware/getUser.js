const { User } = require("../models/users");
// Middleware function to get a user by id
async function getUser(req, res, next) {
    let user;
    try {
      user = await User.findById(req.params.id || req.user.id);
      if (user == null) {
        return res.status(404).json({ error: "true", message: 'User not found' });
      }
    } catch (err) {
      return res.status(500).json({ error: "true", message: err.message });
    }
  
    req.fetchedUser = user;
    next();
}

module.exports = getUser;