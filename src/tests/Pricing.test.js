const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");

// const axios = require('axios');
const pricingController = require("../controller/pricingController");
require("dotenv").config("../../env");

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
        const res = await request(app)
            .post('/create_pricing')
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        pricing_id = res.body.payload._id;
        const pricing = await pricingController.getPricingById(pricing_id);
        expect(res.statusCode).toBe(200);
        expect(pricing).toHaveProperty('name', "test");
        expect(pricing).toHaveProperty('description', "description - test");
        expect(pricing).toHaveProperty('first_hour', 30);
        expect(pricing).toHaveProperty('follow_up', 3);
    });

    it("should return all pricing", async () => {

        const res = await request(app)
            .get('/all_pricing')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThan(0);
    });

    it("should return pricing by pricing_id", async () => {

        const res = await request(app)
            .get('/pricing/' + pricing_id)
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN);
        const pricing = res.body.payload;

        expect(res.statusCode).toBe(200);
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

        const res = await request(app)
            .post('/update_pricing/' + pricing_id)
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        pricing_id = res.body.payload._id;

        expect(res.statusCode).toBe(200);
        expect(res.body.payload).toHaveProperty('name', "test-update");
        expect(res.body.payload).toHaveProperty('description', "description - test-update");
        expect(res.body.payload).toHaveProperty('first_hour', 10);
        expect(res.body.payload).toHaveProperty('follow_up', 1);
    });

    it('should delete pricing by id', async () => {

        const res = await request(app)
            .delete('/delete_pricing/' + pricing_id)
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload).toBe(null);
    });
});

