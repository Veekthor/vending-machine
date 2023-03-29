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
        maxlength: 100
    },
    deposit: {
        type: Number,
        min: 0,
        default: 0,
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

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

userSchema.statics.isUsernameUnique = async function(username) {
  const user = await this.findOne({username});
  return user === null;
}

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