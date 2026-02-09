import express from 'express';
import authentication from './authentication';
import users from './users';
import categories from './categories';
import expenses from './expenses';
import summary from './summary';

const router = express.Router();

export default(): express.Router => {
    authentication(router);
    users(router);
    categories(router);
    expenses(router);
    summary(router);
    return router;
};