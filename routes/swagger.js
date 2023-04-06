const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *  responses:
 *      UnauthorizedError:
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              error:
 *                type: boolean
 *              message:
 *                type: string
 *            example:
 *              error: true
 *              message: Token not provided
 */
const spec = swaggerJsDoc({
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Vending machine',
            version: '1.0.0',
            description: 'lorem ipsum',
            contact: {
                name: "Chuka Ilozulu",
                url: 'https://github.com/Veekthor'
            }
        }
    },
    apis:['./routes/*.js', './models/*.js']
})

router.get('/json', (req, res) => {
    res.header('Content-Type', 'application/json').send(spec);
})

router.use('/', swaggerUi.serve, swaggerUi.setup(spec));
module.exports = router;