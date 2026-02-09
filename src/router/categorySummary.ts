import express from 'express';

import { getCategorySummary } from '../controllers/categorySummary';
import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
    router.get('/categories/:categoryId/summary', isAuthenticated, getCategorySummary);
}
