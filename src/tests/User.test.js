const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const axios = require('axios');
require("dotenv").config();
const MONGO_URI='mongodb+srv://elockhub:zxcasd123456@elock.5nxt5p2.mongodb.net/?retryWrites=true&w=majority';
const BASE_URL = 'http://127.0.0.1:8080';

const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWJkMThmNzc4ZmExYzIyOTY3Mzc0MWYiLCJpYXQiOjE3MTI4NDgwMjZ9.LcG0UFRf2BSEXtJNJZ3np6_ZarloDsnKI_hdDDXOE7s";

let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ADMIN_TOKEN
    }
};

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(MONGO_URI);
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
//
// describe("GET /api/products/:id", () => {
//     it("should return a product", async () => {
//         const res = await request(app).get(
//             "/api/products/6331abc9e9ececcc2d449e44"
//         );
//         expect(res.statusCode).toBe(200);
//         expect(res.body.name).toBe("Product 1");
//     });
// });
//
// describe("POST /api/products", () => {
//     it("should create a product", async () => {
//         const res = await request(app).post("/api/products").send({
//             name: "Product 2",
//             price: 1009,
//             description: "Description 2",
//         });
//         expect(res.statusCode).toBe(201);
//         expect(res.body.name).toBe("Product 2");
//     });
// });
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