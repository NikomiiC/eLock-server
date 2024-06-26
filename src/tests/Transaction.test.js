const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const transactionController = require("../controller/transactionController");
const userController = require("../controller/userController");
require("dotenv").config("../../env");

let trn_id, user;
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("Transaction", () => {

    it("should create a transaction", async () => {

        let data = {
            user_id: "661bfdc2ac36c92048863204",//nic
            locker_id: "66196f2a14d865d36edbc451",
            pricing_id: "661a4f76e39239cd1feb0a76",
            cost: 12,
            create_datetime: new Date(),
            latest_update_datetime: new Date(),
            start_index: 4,//1-3 booked
            end_index: 6,
            start_date: new Date(2024, 3, 28),
            end_date: new Date(2024, 3, 28)
        }

        const res = await request(app)
            .post('/create_transaction')
            .type('json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        trn_id = res.body.payload._id;

        const trn = await transactionController.getTransactionById(trn_id);
        user = await userController.getUserById("661bfdc2ac36c92048863204");

        expect(res.statusCode).toBe(200);
        expect(trn).toHaveProperty('status', "Booked");

        expect(trn).toHaveProperty('user_id',new mongoose.Types.ObjectId('661bfdc2ac36c92048863204'));
        expect(trn).toHaveProperty('locker_id',new mongoose.Types.ObjectId('66196f2a14d865d36edbc451'));
        expect(trn).toHaveProperty('pricing_id',new mongoose.Types.ObjectId('661a4f76e39239cd1feb0a76'));

        //user to trn_list contains new trn
        expect(user.trn_list.includes(trn_id)).toBe(true);
    });

    it("should return all transactions", async () => {

        const res = await request(app)
            .get('/user_all_transaction')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return all transactions of a user", async () => {

        const res = await request(app)
            .get('/user_all_transaction')
            .set('Content-Type',  'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN);

        const locker = res.body.payload.locker;
        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThanOrEqual(0);
        expect(user.trn_list.includes(trn_id)).toBe(true);
    });

});

