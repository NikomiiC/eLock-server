const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index");
const feedbackController = require("../controller/feedbackController");
require("dotenv").config("../../env");

let feedback_id, feedback;
beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

describe("Feedback", () => {
    const trn_id = '662201396892dd0e198a6c86';
    it("should create a feedback", async () => {
        let data = {
            feedback_header: "feedback_header",
            transaction_id: trn_id,
            ticketList: [
                {
                    ticket_body: "ticket_body",
                    reply_body: null,
                    reply_datetime: null
                }
            ]
        };

        const res = await request(app)
            .post('/create_feedback')
            .type('json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN)
            .send(data);

        feedback_id = res.body.payload._id;

        feedback = await feedbackController.getFeedbackById(feedback_id);

        expect(res.statusCode).toBe(200);
        expect(feedback).toHaveProperty('status', "Open");
        expect(feedback).toHaveProperty('feedback_header', "feedback_header");
        expect(feedback.ticketList[0].ticket_body).toBe("ticket_body");
        expect(feedback).toHaveProperty('transaction_id', new mongoose.Types.ObjectId(trn_id));

    });

    it("should update a feedback by admin - response for ticket", async () => {
        let data = {
            reply_body: "admin reply"
        };

        const res = await request(app)
            .post('/update_feedback/edit_ticket/' + feedback_id)
            .type('json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN)
            .send(data);

        feedback = res.body.payload;

        expect(res.statusCode).toBe(200);
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

        const res = await request(app)
            .post('/update_feedback/add_ticket/' + feedback_id)
            .type('json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN)
            .send(data);

        feedback = res.body.payload;

        expect(res.statusCode).toBe(200);
        expect(feedback.ticketList[1].ticket_body).toBe("ticket_body2");

    });

    it("should update a feedback - update status", async () => {
        let data = {
            status: "Closed"
        };

        const res = await request(app)
            .post('/edit_feedback/update_status/' + feedback_id)
            .type('json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN)
            .send(data);

        feedback = res.body.payload;

        expect(res.statusCode).toBe(200);
        expect(feedback).toHaveProperty('status', "Closed");

    });

    it("should return all feedbacks - admin", async () => {

        const res = await request(app)
            .get('/all_feedbacks_all_user')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.ADMIN_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return all feedbacks - user", async () => {

        const res = await request(app)
            .get('/all_feedbacks')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN);

        expect(res.statusCode).toBe(200);
        expect(res.body.payload.length).toBeGreaterThanOrEqual(0);
    });

    it("should return feedback by feedback_id", async () => {

        const res = await request(app)
            .get('/feedback/' + feedback_id)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + process.env.NICOLE_TOKEN);

        feedback = res.body.payload;
        expect(res.statusCode).toBe(200);
        expect(feedback._id).toBe(feedback_id);
    });
});

