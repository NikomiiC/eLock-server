const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const axios = require('axios');
require("dotenv").config("../../env");
const userController = require("../controller/userController");

let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN
    }
};
let user_id;
/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("GET /all_users", () => {
    it("should return all users", async () => {
        config.url = process.env.BASE_URL + '/all_users';
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThan(0);
    });
});

describe("GET /user/:id", () => {
    it("should return user by user_id", async () => {
        const user_id = '661bfdc2ac36c92048863204';
        config.url = process.env.BASE_URL + '/user/' + user_id;
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
        config.url = process.env.BASE_URL + '/update_user';
        config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
        config.data = data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.username).toBe("nicole");
        expect(res.data.payload.gender).toBe("F");
        expect(res.data.payload.dob).toBe(null);
    });
});