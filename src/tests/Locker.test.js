const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const axios = require('axios');
const lockerController = require("../controller/lockerController");
require("dotenv").config("../../env");

let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN
    }
};

let locker_id;
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("Locker", () => {

    it("should create a locker", async () => {
        let data = JSON.stringify([
            {
                "size": "Small"
            }
        ]);

        config.url = process.env.BASE_URL + '/create_lockers';
        config.headers.Authorization = 'Bearer ' + process.env.ADMIN_TOKEN;
        config.data = data;
        const res = await axios.request(config);
        locker_id = res.data.payload[0]._id;

        const locker = await lockerController.getLockerById(locker_id);

        expect(res.status).toBe(200);
        expect(locker).toHaveProperty('status', "Valid");
        expect(locker).toHaveProperty('size', "Small");
        expect(locker).toHaveProperty('passcode', "000000");
    });

    it("should return all lockers", async () => {
        config.url = process.env.BASE_URL + '/all_lockers';
        config.method = 'get';
        delete config.data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return locker by locker_id", async () => {
        config.url = process.env.BASE_URL + '/locker/' + locker_id;
        const res = await axios.request(config);
        const locker = res.data.payload.locker;
        expect(res.status).toBe(200);
        expect(locker).toHaveProperty('status', "Valid");
        expect(locker).toHaveProperty('size', "Small");
        expect(locker).toHaveProperty('passcode', "000000");
    });

    it("should return lockers by location_id", async () => {
        config.url = process.env.BASE_URL + '/lockers/by_location_id/65f2b25da2a3d734df64142b';

        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return locker by transaction id", async () => {
        config.url = process.env.BASE_URL + '/locker/by_trn_id/661813879df314e10d900ae4';

        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should update a locker status by id", async () => {
        let data = JSON.stringify({
            "status": "Occupied"
        });
        config.method = 'post';
        config.url = process.env.BASE_URL + '/locker/update_status/' + locker_id;
        config.data = data;
        const res = await axios.request(config);
        const locker = res.data.payload;
        expect(res.status).toBe(200);
        expect(locker).toHaveProperty('status', "Occupied");
        expect(locker).toHaveProperty('size', "Small");
        expect(locker).toHaveProperty('passcode', "000000");
    });

    it("should update a locker passcode by id", async () => {
        let data = JSON.stringify({
            "passcode": "123456"
        });
        config.method = 'post';
        config.url = process.env.BASE_URL + '/locker/update_passcode/' + locker_id;
        config.data = data;
        const res = await axios.request(config);
        const locker = res.data.payload;
        expect(res.status).toBe(200);
        expect(locker).toHaveProperty('passcode', "123456");
    });

    it('should delete locker by id', async () => {

        let data = JSON.stringify({
            "location_id": "",
            "locker_list": [
                locker_id
            ]
        });

        config.url = process.env.BASE_URL + '/delete_locker';
        config.data = data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload).toBe(null);
    });
});

