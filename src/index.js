require("dotenv").config();

// require('./models/User');


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const authRoutes = require('./routes/authRoutes');
// const requireAuth = require('./middlewares/requireAuth');
// const userRoutes = require('./routes/userRoutes');

const mongoUri = process.env.MONGO_URI;
const app = express();
const cors = require("cors");

// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use(bodyParser.json());
// app.use(authRoutes);
// app.use(userRoutes);

// app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect(mongoUri,);
// mongoose.connection.on('connected', () => {
//     console.log('mongo db connected');
// });
// mongoose.connection.on('error', (err) => {
//     console.log('error connecting to mongo', err);
// });

// app.get('/', requireAuth, (req, res) => {
//     //todo: reformat response and update frontend
//     // res.send(`Your email: ${req.user.email}`);
//     res.send(`${req.user._id}`);
// });

app.listen(8080, () => {
    console.log('listening on port 8080');
});