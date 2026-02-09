import express from 'express';

import { isAuthenticated } from '../middlewares';
import { getSummary } from '../controllers/summary';

export default (router: express.Router) => {
    router.get('/summary', isAuthenticated, getSummary);
};