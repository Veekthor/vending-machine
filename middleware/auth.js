const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if(!token) return res.status(401).json({error: true, message: 'Token not provided'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({error: true, message: 'Invalid token.'});
        throw error;
    }
}

module.exports = auth;