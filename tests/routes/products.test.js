const request = require("supertest");
const { Product } = require("../../models/products");
const { User } = require("../../models/users");
describe("/api/products", () => {
    let server;
    let user;
    let token;
    beforeAll(async () => {
        server = require("../../index");
        user = await User.create({
            username: "tester123",
            password: "test123",
            deposit: 0,
            role: "buyer",
        });
        token = user.generateAuthToken();
    })
    afterAll(async() => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await server.close();
    })

    describe('POST /buy', () => {
        it('should allow users with a “buyer” role to buy a product with their deposited coins', async () => {
            user.deposit = 200;
            await user.save();
            const seller = await User.create({
                username: "seller123",
                password: "seller123",
                role: "seller"
            })
            const product = await Product.create({
              productName: 'Soda',
              amountAvailable: 10,
              cost: 50,
              sellerId: seller._id,
            });
        
            const response = await request(server)
              .post('/api/products/buy')
              .set('Authorization', 'Bearer ' + token)
              .send({ productId: product._id, amount: 2 });
            expect(response.statusCode).toBe(200);
            expect(response.body.totalSpent).toBe(100);
            expect(response.body.change).toEqual([0, 0, 0, 0, 1]);
        });
    });
})