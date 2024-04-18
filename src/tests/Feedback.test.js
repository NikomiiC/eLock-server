const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const axios = require('axios');
const feedbackController = require("../controller/feedbackController");
require("dotenv").config("../../env");

let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.NICOLE_TOKEN
    }
};

let feedback_id, feedback;
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("Feedback", () => {
    const trn_id = '66213c3e5c4700bf8fda6335';
    it("should create a feedback", async () => {
        let data = {
            feedback_header: "feedback_header",
            transaction_id: "66213c3e5c4700bf8fda6335",
            ticketList: [
                {
                    ticket_body: "ticket_body",
                    reply_body: null,
                    reply_datetime: null
                }
            ]
        };

        config.url = process.env.BASE_URL + '/create_feedback';
        config.data = data;
        const res = await axios.request(config);
        feedback_id = res.data.payload._id;

        feedback = await feedbackController.getFeedbackById(feedback_id);

        expect(res.status).toBe(200);
        expect(feedback).toHaveProperty('status', "Open");
        expect(feedback).toHaveProperty('feedback_header', "feedback_header");
        expect(feedback.ticketList[0].ticket_body).toBe("ticket_body");
        expect(feedback).toHaveProperty('transaction_id', new mongoose.Types.ObjectId('66213c3e5c4700bf8fda6335'));

    });

    it("should update a feedback by admin - response for ticket", async () => {
        let data = {
            reply_body: "admin reply"
        };
        config.url = process.env.BASE_URL + '/update_feedback/edit_ticket/' + feedback_id;
        config.headers.Authorization = 'Bearer ' + process.env.ADMIN_TOKEN;
        config.data = data;
        const res = await axios.request(config);

        feedback = res.data.payload;

        expect(res.status).toBe(200);
        expect(feedback.ticketList[0].reply_body).toBe("admin reply");

    });

    it("should update a feedback by user - add ticket", async () => {
        let data = {
            feedback_header: "feedback_header",
            transaction_id: "66213c3e5c4700bf8fda6335",
            ticketList: [
                {
                    ticket_body: "ticket_body2",
                    reply_body: null,
                    reply_datetime: null
                }
            ]
        };
        config.url = process.env.BASE_URL + '/update_feedback/add_ticket/' + feedback_id;
        config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
        config.data = data;
        const res = await axios.request(config);

        feedback = res.data.payload;

        expect(res.status).toBe(200);
        expect(feedback.ticketList[1].ticket_body).toBe("ticket_body2");

    });

    it("should update a feedback - update status", async () => {
        let data = {
            status: "Closed"
        };
        config.url = process.env.BASE_URL + '/edit_feedback/update_status/' + feedback_id;

        config.data = data;
        const res = await axios.request(config);

        feedback = res.data.payload;

        expect(res.status).toBe(200);
        expect(feedback).toHaveProperty('status', "Closed");

    });

    it("should return all feedbacks - admin", async () => {
        config.url = process.env.BASE_URL + '/all_feedbacks_all_user';
        config.method = 'get';
        config.headers.Authorization = 'Bearer ' + process.env.ADMIN_TOKEN;
        delete config.data;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return all feedbacks - user", async () => {
        config.url = process.env.BASE_URL + '/all_feedbacks';
        config.headers.Authorization = 'Bearer ' + process.env.NICOLE_TOKEN;
        const res = await axios.request(config);
        expect(res.status).toBe(200);
        expect(res.data.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return feedback by feedback_id", async () => {
        config.url = process.env.BASE_URL + '/feedback/' + feedback_id;
        const res = await axios.request(config);
        feedback = res.data.payload;
        expect(res.status).toBe(200);
        expect(feedback._id).toBe(feedback_id);
    });
});

