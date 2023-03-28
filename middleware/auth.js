const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send({error: true, msg: 'Token not provided'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send({error: true, msg: 'Invalid token.'});
        throw error;
    }
}

module.exports = auth;