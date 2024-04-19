const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const locationController = require("../controller/locationController");
require("dotenv").config("../../env");

let location_id;
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
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

        const res = await request(app)
            .post('/create_location')
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        const location = await locationController.getLocationById(res.body.payload._id);
        location_id = res.body.payload._id;

        expect(res.statusCode).toBe(200);
        expect(location).toHaveProperty('area', "Area-Test");
        expect(location).toHaveProperty('formatted_address', "Address-Test");
        expect(location).toHaveProperty('postcode', "640111");
    });

    it("should return all location", async () => {

        const res = await request(app)
            .get('/all_locations')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThan(0);
    });

    it("should return location by location_id", async () => {

        const res = await request(app)
            .get('/location/' + location_id)
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        location = res.body.payload;
        expect(res.statusCode).toBe(200);
        expect(location).toHaveProperty('area', "Area-Test");
        expect(location).toHaveProperty('formatted_address', 'Address-Test');
        expect(location).toHaveProperty('postcode', "640111");
    });

    it("should return locations by addressName", async () => {
        const res = await request(app)
            .get('/location/addressName/' + 'Test')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThan(0);
    });

    it("should return locations by postcode", async () => {

        const res = await request(app)
            .get('/location_postcode/640111')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBe(1);
    });

    it("should return locations by area", async () => {

        const res = await request(app)
            .get('/locations/' + 'Area-Test')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThan(0);
    });

    it("should return locations by lon lat", async () => {
        const res = await request(app)
            .get('/locations/' + 103.721141 +'/' + 1.348159)
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThan(0);
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
        const res = await request(app)
            .post('/update_location/' + location_id)
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        location = res.body.payload;
        expect(res.statusCode).toBe(200);
        expect(location).toHaveProperty('area', "Area-Test-Update");
        expect(location).toHaveProperty('formatted_address', "Address-Test-Update");
        expect(location).toHaveProperty('postcode', "640111");
    });

    it("should update a location for adding lockers by id", async () => {
        let data = JSON.stringify({
            "locker_list": [
                "661f6e11e3badb148f757a58"
            ]
        });

        const res = await request(app)
            .post('/update_location/add_lockers/' + location_id)
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        location = res.body.payload;
        expect(res.statusCode).toBe(200);
        expect(location.locker_list.includes('661f6e11e3badb148f757a58')).toBe(true);
    });

    it("should update a location for removing lockers by id", async () => {
        let data = JSON.stringify({
            "locker_list": [
                "661f6e11e3badb148f757a58"
            ]
        });

        const res = await request(app)
            .post('/update_location/remove_lockers/' + location_id)
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        location = res.body.payload;
        expect(res.statusCode).toBe(200);
        expect(location.locker_list).not.toContain('661f6e11e3badb148f757a58');
    });

    it('should delete location by id', async () => {

        const res = await request(app)
            .delete('/delete_location/' + location_id)
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload).toBe(null);
    });
});

