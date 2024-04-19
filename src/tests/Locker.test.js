const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const lockerController = require("../controller/lockerController");
require("dotenv").config("../../env");

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

        const res = await request(app)
            .post('/create_lockers')
            .type('json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        locker_id = res.body.payload[0]._id;

        const locker = await lockerController.getLockerById(locker_id);

        expect(res.statusCode).toBe(200);
        expect(locker).toHaveProperty('status', "Valid");
        expect(locker).toHaveProperty('size', "Small");
        expect(locker).toHaveProperty('passcode', "000000");
    });

    it("should return all lockers", async () => {

        const res = await request(app)
            .get('/all_lockers')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return locker by locker_id", async () => {

        const res = await request(app)
            .get('/locker/' + locker_id)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        const locker = res.body.payload.locker;
        expect(res.statusCode).toBe(200);
        expect(locker).toHaveProperty('status', "Valid");
        expect(locker).toHaveProperty('size', "Small");
        expect(locker).toHaveProperty('passcode', "000000");
    });

    it("should return lockers by location_id", async () => {

        const res = await request(app)
            .get('/lockers/by_location_id/65f2b25da2a3d734df64142b')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return locker by transaction id", async () => {
        const res = await request(app)
            .get('/locker/by_trn_id/661813879df314e10d900ae4')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should update a locker status by id", async () => {
        let data = JSON.stringify({
            "status": "Occupied"
        });

        const res = await request(app)
            .post('/locker/update_status/' + locker_id)
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        const locker = res.body.payload;
        expect(res.statusCode).toBe(200);
        expect(locker).toHaveProperty('status', "Occupied");
        expect(locker).toHaveProperty('size', "Small");
        expect(locker).toHaveProperty('passcode', "000000");
    });

    it("should update a locker passcode by id", async () => {
        let data = JSON.stringify({
            "passcode": "123456"
        });

        const res = await request(app)
            .post('/locker/update_passcode/' + locker_id)
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        const locker = res.body.payload;
        expect(res.statusCode).toBe(200);
        expect(locker).toHaveProperty('passcode', "123456");
    });

    it('should delete locker by id', async () => {

        let data = JSON.stringify({
            "location_id": "",
            "locker_list": [
                locker_id
            ]
        });

        const res = await request(app)
            .post('/delete_locker')
            .type('json')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload).toBe(null);
    });
});

