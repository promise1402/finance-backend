import express from 'express';

import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories';

import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
    router.get('/categories', isAuthenticated, getCategories);
    router.post('/categories', isAuthenticated, createCategory);
    router.patch('/categories/:id', isAuthenticated, updateCategory);
    router.delete('/categories/:id', isAuthenticated, deleteCategory);
};