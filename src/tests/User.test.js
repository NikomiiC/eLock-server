const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const axios = require('axios');
require("dotenv").config("../../env");

let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN
    }
};

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe("GET /all_users", () => {
    it("should return all users", async () => {
        config.url = config.url + '/all_users';
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThan(0);
    });
});

describe("GET /user/:id", () => {
    it("should return user by user_id", async () => {
        const user_id = '661bfdc2ac36c92048863204';
        config.url = config.url + '/user/' + user_id;
        config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.username).toBe("nicole");
    });
});

describe("POST /update_user", () => {
    it("should update a user", async () => {
        let data = JSON.stringify({
            "action": "UPDATE",
            "doc": {
                "username": "nicole",
                "gender": "F",
                "dob": ""
            }
        });
        config.method = 'post';
        config.url = config.url + '/update_user';
        config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
        config.data = data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.username).toBe("nicole");
        expect(res.data.payload.gender).toBe("F");
        expect(res.data.payload.dob).toBe(null);
    });
});
//
// describe("PUT /api/products/:id", () => {
//     it("should update a product", async () => {
//         const res = await request(app)
//             .patch("/api/products/6331abc9e9ececcc2d449e44")
//             .send({
//                 name: "Product 4",
//                 price: 104,
//                 description: "Description 4",
//             });
//         expect(res.statusCode).toBe(200);
//         expect(res.body.price).toBe(104);
//     });
// });
//
// describe("DELETE /api/products/:id", () => {
//     it("should delete a product", async () => {
//         const res = await request(app).delete(
//             "/api/products/6331abc9e9ececcc2d449e44"
//         );
//         expect(res.statusCode).toBe(200);
//     });
// });