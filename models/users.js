const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
        },
    }
});

// Hash the password before saving
userSchema.pre('save', function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // override the plaintext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// Compare user password with hashed password
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({id: this._id, username: this.username, role: this.role}, process.env.JWT_PRIVATE_KEY);

    return token;
};
const User = mongoose.model('User', userSchema)

exports.User = User;