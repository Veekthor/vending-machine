const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - username
 *          - password
 *          - role
 *        properties:
 *          _id:
 *            type: string
 *            description: object ID in DB(set by mongoose).
 *          username:
 *            type: string
 *            minlength: 5
 *            maxlength: 20
 *            description: Username
 *          password:
 *            type: string
 *            minlength: 5
 *            maxlength: 100
 *            description: Password
 *          deposit:
 *            type: integer
 *            minimum: 0
 *            maximum: 1,000,000
 *            default: 0
 *            description: User's deposit
 *          role:
 *            type: string
 *            enum: [buyer, seller]
 *            default: buyer
 *            description: User's role
 *        example:
 *          _id: 2345654cdhhw345dnchd4583c
 *          name: John Doe
 *          password: 12345678
 *          deposit: 255
 *          role: buyer
 */

/**
 * @swagger
 *  components:
 *    requestBodies:
 *      UserInput:
 *        required: true
 *        content:
 *          application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minlength: 5
 *                 maxlength: 20
 *                 description: Username
 *               password:
 *                 type: string
 *                 minlength: 5
 *                 maxlength: 100
 *                 description: Password
 *               role:
 *                 type: string
 *                 enum: [buyer, seller]
 *                 default: buyer
 *                 description: User's role
 *             example:
 *               username: test123
 *               password: testpass
 *               role: seller
 */

/**
 * @swagger
 * components:
 *   responses:
 *     UserResponse:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            required:
 *              - username
 *              - deposit
 *              - role
 *            properties:
 *              username:
 *                type: string
 *                minlength: 5
 *                maxlength: 20
 *                description: Username
 *              deposit:
 *                type: integer
 *                default: 0
 *                maximum: 1,000,000
 *                description: User's deposit
 *              role:
 *                type: string
 *                enum: [buyer, seller]
 *                default: buyer
 *                description: User's role
 *            example:
 *              username: test123
 *              deposit: 300
 *              role: seller
 */

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
        max: 1_000_000,
        default: 0,
        validate : {
          validator : Number.isInteger,
          message   : '{VALUE} is not an integer value',
        },
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