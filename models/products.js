const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * @swagger
 *  components:
 *    schemas:
 *      Product:
 *        type: object
 *        required:
 *          - cost
 *          - productName
 *          - sellerId
 *        properties:
 *          _id:
 *            type: string
 *            description: object ID in DB(set by mongoose).
 *          amountAvailable:
 *            type: integer
 *            minimum: 0
 *            maximum: 500
 *            default: 0
 *            description: Amount of product items available
 *          cost:
 *            type: integer
 *            minimum: 0
 *            maximum: 1,000,000
 *            multipleOf: 5
 *            description: Cost of product; must be multiple of 5
 *          productName:
 *            type: string
 *            minlength: 3
 *            maxlength: 20
 *            description: Product's name
 *          sellerId:
 *            type: string
 *            description: object ID of seller in DB
 */
const productSchema = new Schema({
    amountAvailable: {
        type: Number,
        min: 0,
        max: 500,
        default: 0,
        validate : {
          validator : Number.isInteger,
          message   : '{VALUE} is not an integer value'
        }
    },
    cost: {
        type: Number,
        required: true,
        min: 0,
        max: 1_000_000,
        validate: {
            validator: v => !(v % 5),
            message: props => `${props.path} should be a multiple of 5`,
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