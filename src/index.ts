import express from 'express';
import http from 'http';
import bodyparser from 'body-parser';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import router from './router';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
}));

app.use(compression())
app.use(bodyparser.json());
app.use(cookieparser());

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const MONGO_URI=process.env.MONGO_URI || 'mongodb://localhost:27017/finance-manager';

if(!MONGO_URI) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.Promise = Promise;
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err: Error) => {
        console.error('Error connecting to MongoDB', err);
    });

app.use('/', router());
    