const mongoose = require("mongoose");

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send({error: true, msg: 'ID is not valid'});

    next();
};
module.exports = validateObjectId;