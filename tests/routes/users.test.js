const request = require("supertest");
const { User } = require("../../models/users");
describe("/api/users", () => {
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
        await server.close();
    })

    describe('POST /', () => {
        it('should allow registration of user', async () => {
            const userData = {
                username: "testing123",
                password: "test123",
                role: "buyer",
            }
            const response = await request(server)
                .post('/api/users')
                .send(userData);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("User Created successfully");
            expect(response.body.token).not.toBeFalsy();
        })
    })

    describe('POST /deposit', () => {
        it('should allow users with a “buyer” role to deposit only 5, 10, 20, 50, and 100 cent coins', async () => {
            const coin = 50;
            const response = await request(server)
                .post('/api/users/deposit')
                .set('Authorization', 'Bearer ' + token)
                .send({ coin });
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe(`Deposited ${coin} cents into account`);
            expect(response.body.data.deposit).toBe(50);
        });
    });
})