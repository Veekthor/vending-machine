const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 20,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 1024
    },
    deposit: {
        type: {
            five: {
                type: Number,
                min: 0,
                default: 0
            },
            ten: {
                type: Number,
                min: 0,
                default: 0
            },
            twenty: {
                type: Number,
                min: 0,
                default: 0
            },
            fifty: {
                type: Number,
                min: 0,
                default: 0
            },
            hundred: {
                type: Number,
                min: 0,
                default: 0
            },
        }
    },
    role: {
        type: String,
        required: true,
        enum: {
            values: ["seller", "buyer"],
            message: "{VALUE} is not a valid role"
        }
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({username: this.username, role: this.role}, process.env.JWT_PRIVATE_KEY);

    return token;
};
const User = mongoose.model('User', userSchema)

exports.User = User;