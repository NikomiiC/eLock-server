const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const axios = require('axios');
const transactionController = require("../controller/transactionController");
const userController = require("../controller/userController");
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

        config.url = process.env.BASE_URL + '/create_transaction';
        config.headers.Authorization = 'Bearer ' + process.env.ADMIN_TOKEN;
        config.data = data;
        const res = await axios.request(config);
        trn_id = res.data.payload._id;

        const trn = await transactionController.getTransactionById(trn_id);
        user = await userController.getUserById("661bfdc2ac36c92048863204");

        expect(res.status).toBe(200);
        expect(trn).toHaveProperty('status', "Booked");

        expect(trn).toHaveProperty('user_id',new mongoose.Types.ObjectId('661bfdc2ac36c92048863204'));
        expect(trn).toHaveProperty('locker_id',new mongoose.Types.ObjectId('66196f2a14d865d36edbc451'));
        expect(trn).toHaveProperty('pricing_id',new mongoose.Types.ObjectId('661a4f76e39239cd1feb0a76'));

        //user to trn_list contains new trn
        expect(user.trn_list.includes(trn_id)).toBe(true);
    });

    it("should return all transactions", async () => {
        config.url = process.env.BASE_URL + '/user_all_transaction';
        config.method = 'get';
        delete config.data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return all transactions of a user", async () => {
        config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
        config.url = process.env.BASE_URL + '/user_all_transaction';
        const res = await axios.request(config);
        const locker = res.data.payload.locker;
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThanOrEqual(0);
        expect(user.trn_list.includes(trn_id)).toBe(true);
    });


    // ///teste
    // it("test", async () => {
    //     config.method = 'get';
    //     user = await userController.getUserById("661bfdc2ac36c92048863204");
    //     config.url = process.env.BASE_URL + '/user/661bfdc2ac36c92048863204';
    //     config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
    //     const res = await axios.request(config);
    //     expect(res.status).toBe(200);
    //     expect(res.data.payload.username).toBe("nicole");
    //     expect(res.data.payload._id).toBe('661bfdc2ac36c92048863204');
    //     expect(user).toHaveProperty('_id',new mongoose.Types.ObjectId('661bfdc2ac36c92048863204'));
    // });

});

