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
 *            example: 642d06b643f6f447711afd06
 *          amountAvailable:
 *            type: integer
 *            minimum: 0
 *            maximum: 500
 *            default: 0
 *            description: Amount of product items available
 *            example: 56
 *          cost:
 *            type: integer
 *            minimum: 0
 *            maximum: 1,000,000
 *            multipleOf: 5
 *            description: Cost of product; must be multiple of 5
 *            example: 540
 *          productName:
 *            type: string
 *            minlength: 3
 *            maxlength: 20
 *            description: Product's name
 *            example: product123
 *          sellerId:
 *            type: string
 *            description: object ID of seller in DB
 *            example: 642d06b643f6f447711afd06
 */

/**
 * @swagger
 *  components:
 *    requestBodies:
 *      ProductInput:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - cost
 *                - productName
 *                - sellerId
 *              properties:
 *                amountAvailable:
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 500
 *                  default: 0
 *                  description: Amount of product items available
 *                  example: 56
 *                cost:
 *                  type: integer
 *                  minimum: 0
 *                  maximum: 1,000,000
 *                  multipleOf: 5
 *                  description: Cost of product; must be multiple of 5
 *                  example: 540
 *                productName:
 *                  type: string
 *                  minlength: 3
 *                  maxlength: 20
 *                  description: Product's name
 *                  example: product123
 *                sellerId:
 *                  type: string
 *                  description: object ID of seller in DB
 *                  example: 642d06b643f6f447711afd06
 */
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