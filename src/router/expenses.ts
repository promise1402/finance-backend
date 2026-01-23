import express from 'express';

import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenses';

import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
    router.get('/expenses', isAuthenticated, getExpenses);
    router.post('/expenses', isAuthenticated, createExpense);
    router.patch('/expenses/:id', isAuthenticated, updateExpense);
    router.delete('/expenses/:id', isAuthenticated, deleteExpense);
};