const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");

// const axios = require('axios');
const pricingController = require("../controller/pricingController");
require("dotenv").config("../../env");

let config = {
    // method: 'get',
    // maxBodyLength: Infinity,
    baseUrl: process.env.BASE_URL,
    authorization: {"Authorization": 'Bearer ' + process.env.ADMIN_TOKEN},
    // headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN
    // }
};
const baseUrl = process.env.BASE_URL
let pricing_id;
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("Pricing", () => {

    it("should create a pricing", async () => {
        let data = JSON.stringify({
            "name": "test",
            "description": "description - test",
            "first_hour": 30,
            "follow_up": 3
        });

        // config.method = 'post';
        // config.url = baseUrl + '/create_pricing';
        // config.headers.Authorization = 'Bearer ' + process.env.ADMIN_TOKEN;
        // config.data = data;
        //const res = await axios.request(config);
        const res = await request(app)
            // .set('Content-Type',  'application/json')
            // .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .post('/create_pricing')
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        pricing_id = res._body.payload._id;
        const pricing = await pricingController.getPricingById(pricing_id);
        expect(res.statusCode).toBe(200);
        expect(pricing).toHaveProperty('name', "test");
        expect(pricing).toHaveProperty('description', "description - test");
        expect(pricing).toHaveProperty('first_hour', 30);
        expect(pricing).toHaveProperty('follow_up', 3);
    });

    it("should return all pricing", async () => {
        config.url = process.env.BASE_URL + '/all_pricing';
        config.method = 'get';
        delete config.data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThan(0);
    });

    it("should return pricing by pricing_id", async () => {
        config.url = process.env.BASE_URL + '/pricing/' + pricing_id;
        config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        const pricing = res.data.payload;
        expect(pricing).toHaveProperty('name', "test");
        expect(pricing).toHaveProperty('description', "description - test");
        expect(pricing).toHaveProperty('first_hour', 30);
        expect(pricing).toHaveProperty('follow_up', 3);
    });

    it("should update a pricing", async () => {
        let data = JSON.stringify({
            "name": "test-update",
            "description": "description - test-update",
            "first_hour": 10,
            "follow_up": 1
        });

        config.method = 'post';
        config.url = process.env.BASE_URL + '/update_pricing/' + pricing_id;
        config.headers.Authorization = 'Bearer ' + process.env.ADMIN_TOKEN;
        config.data = data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload).toHaveProperty('name', "test-update");
        expect(res.data.payload).toHaveProperty('description', "description - test-update");
        expect(res.data.payload).toHaveProperty('first_hour', 10);
        expect(res.data.payload).toHaveProperty('follow_up', 1);
    });

    it('should delete pricing by id', async () => {
        config.method = 'delete';

        config.url = process.env.BASE_URL + '/delete_pricing/' + pricing_id;
        delete config.data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload).toBe(null);
    });
});

