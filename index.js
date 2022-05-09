require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware')
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const PORT = process.env.PORT || 5000;

const app = express()

app.use(express.json());
app.use(fileUpload({
    createParentPath: true
}));

// For using cookies
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
app.use(errorMiddleware);

// For uploading files
app.use(express.static('uploads'));


const start = async () => {
    try {
        // MongoDb connection
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await app.listen(PORT, () => {
            console.log('Server started at port ' + PORT);
        })
    } catch (e) {
        console.log(e)
    }
}

start();