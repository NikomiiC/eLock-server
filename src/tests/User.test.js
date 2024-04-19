const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
require("dotenv").config("../../env");
const userController = require("../controller/userController");


/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("User", () => {
    it("should return all users", async () => {

        const res = await request(app)
            .get('/all_users')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThan(0);

        expect(res.status).toBe(200);
        expect(res.body.payload.length).toBeGreaterThan(0);
    });

    it("should return user by user_id", async () => {
        const user_id = '661bfdc2ac36c92048863204';

        const res = await request(app)
            .get('/user/' + user_id)
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.username).toBe("nicole");
    });

    it("should update a user", async () => {
        let data = JSON.stringify({
            "action": "UPDATE",
            "doc": {
                "username": "nicole",
                "gender": "F",
                "dob": ""
            }
        });

        const res = await request(app)
            .post('/update_user')
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN)
            .send(data);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.username).toBe("nicole");
        expect(res.body.payload.gender).toBe("F");
        expect(res.body.payload.dob).toBe(null);
    });

});
