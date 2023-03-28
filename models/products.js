const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
    amountAvailable: {
        type: Number,
        min: 0,
        default: 0,
    },
    cost: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: v => !(v % 5),
            message: props => `${props.path} should be a multiple of 5`
        }
    },
    productName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Product = mongoose.model('Product', productSchema);

exports.Product = Product;