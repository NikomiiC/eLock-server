const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const axios = require('axios');
const locationController = require("../controller/locationController");
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

let location_id;
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("Location", () => {

    it("should create a location", async () => {
        let data = JSON.stringify({
            "area": "Area-Test",
            "formatted_address": "Address-Test",
            "postcode": "640111",
            "loc": {
                "coordinates": [
                    103.721141,
                    1.348159
                ]
            }
        });

        config.url = process.env.BASE_URL + '/create_location';
        config.headers.Authorization = 'Bearer ' + process.env.ADMIN_TOKEN;
        config.data = data;
        const res = await axios.request(config);
        const location = await locationController.getLocationById(res.data.payload._id);
        location_id = res.data.payload._id;

        expect(res.status).toBe(200);
        expect(location).toHaveProperty('area', "Area-Test");
        expect(location).toHaveProperty('formatted_address', "Address-Test");
        expect(location).toHaveProperty('postcode', "640111");
    });

    it("should return all location", async () => {
        config.url = process.env.BASE_URL + '/all_locations';
        config.method = 'get';
        delete config.data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThan(0);
    });

    it("should return location by location_id", async () => {
        config.url = process.env.BASE_URL + '/location/' + location_id;
        const res = await axios.request(config);
        location = res.data.payload;
        expect(res.status).toBe(200);
        expect(location).toHaveProperty('area', "Area-Test");
        expect(location).toHaveProperty('formatted_address', 'Address-Test');
        expect(location).toHaveProperty('postcode', "640111");
        //expect(location).toHaveProperty('loc', loc);
    });

    it("should return locations by addressName", async () => {
        config.url = process.env.BASE_URL + '/location/addressName/' + 'Test';
        console.log(config);
        const res = await axios.request(config);
        console.log(res);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThan(0);
    });

    it("should return locations by postcode", async () => {
        config.url = process.env.BASE_URL + '/location_postcode/640111';

        const res = await axios.request(config);
        console.log(res);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBe(1);
    });

    it("should return locations by area", async () => {
        config.url = process.env.BASE_URL + '/locations/' + 'Area-Test';
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThan(0);
    });

    it("should return locations by lon lat", async () => {
        config.url = process.env.BASE_URL + '/locations/' + 103.721141 +'/' + 1.348159;
        console.log(config);
        const res = await axios.request(config);
        console.log(res);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThan(0);
    });

    it("should update a location by id", async () => {
        let data = JSON.stringify({
            "area": "Area-Test-Update",
            "formatted_address": "Address-Test-Update",
            "postcode": "640111",
            "loc": {
                "coordinates": [
                    103.721141,
                    1.348159
                ]
            }
        });
        config.method = 'post';
        config.url = process.env.BASE_URL + '/update_location/' + location_id;
        config.data = data;
        console.log(config);
        const res = await axios.request(config);
        location = res.data.payload;
        expect(res.status).toBe(200);
        expect(location).toHaveProperty('area', "Area-Test-Update");
        expect(location).toHaveProperty('formatted_address', "Address-Test-Update");
        expect(location).toHaveProperty('postcode', "640111");
        //expect(location).toHaveProperty('loc', loc);
    });

    it("should update a location for adding lockers by id", async () => {
        let data = JSON.stringify({
            "locker_list": [
                "661f6e11e3badb148f757a58"
            ]
        });
        config.method = 'post';
        config.url = process.env.BASE_URL + '/update_location/add_lockers/' + location_id;
        config.data = data;
        const res = await axios.request(config);
        console.log(res);
        location = res.data.payload;
        expect(res.status).toBe(200);
        expect(location.locker_list.includes('661f6e11e3badb148f757a58')).toBe(true);
    });

    it("should update a location for removing lockers by id", async () => {
        let data = JSON.stringify({
            "locker_list": [
                "661f6e11e3badb148f757a58"
            ]
        });
        config.method = 'post';
        config.url = process.env.BASE_URL + '/update_location/remove_lockers/' + location_id;
        config.data = data;
        const res = await axios.request(config);
        location = res.data.payload;
        expect(res.status).toBe(200);
        expect(location.locker_list).not.toContain('661f6e11e3badb148f757a58');
    });

    it('should delete location by id', async () => {
        config.method = 'delete';

        config.url = process.env.BASE_URL + '/delete_location/' + location_id;
        delete config.data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload).toBe(null);
    });
});

