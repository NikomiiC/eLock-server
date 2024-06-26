require('dotenv').config();

require('./models/Token');
require('./models/User');
require('./models/Feedback');
require('./models/Location');
require('./models/Pricing');
require('./models/Locker');
require('./models/Transaction');
require('./models/Slots');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const requireAuth = require('./middlewares/requireAuth');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const locationRoutes = require('./routes/locationRoutes');
const lockerRoutes = require('./routes/lockerRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');


const mongoUri = process.env.MONGO_URI;
const app = express();
const cors = require("cors");

// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(authRoutes);
app.use(userRoutes);
app.use(feedbackRoutes);
app.use(locationRoutes);
app.use(lockerRoutes);
app.use(pricingRoutes);
app.use(transactionRoutes);

// app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(mongoUri,);
mongoose.connection.on('connected', () => {
    console.log('mongo db connected');
});
mongoose.connection.on('error', (err) => {
    console.log('error connecting to mongo', err);
});

app.get('/', requireAuth, (req, res) => {
    //NOTE: reformat response and update frontend, decide later
    // res.send(`Your email: ${req.user.email}`);
    res.send(`${req.user._id}`);
});

//NOTE: comment out listen port when run test env
app.listen(8081, () => {
    console.log('listening on port 8081 ');
});

module.exports = app;