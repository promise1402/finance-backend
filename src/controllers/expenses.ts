import express from 'express';

import { getExpenseById, createExpense as createExpenseInDb, deleteExpenseById, updateExpenseById, getExpensesByUserId } from '../db/expenses';
import { getCategoryById } from '../db/categories';

type AuthenticatedRequest = express.Request & {
    user: {
        _id: string;
    };
};

export const getExpenses = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const userId = req.user._id;
        const expenses = await getExpensesByUserId(userId).populate('category', 'name');
        return res.status(200).json({ expenses });
        
    } catch (error) {
        console.error('Error in Get Expenses controller:', error);
        return res.status(500).json({ message: 'Internal server error' }); 
    }
}

export const createExpense = async (req: AuthenticatedRequest, res: express.Response) => {
    try {

        const userId = req.user._id;
        const { amount, note, date, category } = req.body;
        if (amount === undefined || !date || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingCategory = await getCategoryById(category);
        if (!existingCategory || existingCategory.user.toString() !== userId.toString()) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const expense = await createExpenseInDb({ amount, note, date, category, user: userId });
        return res.status(201).json({ message: 'Expense created successfully', expense });
        
    } catch (error) {
        console.error('Error in Create Expense controller:', error);
        return res.status(500).json({ message: 'Internal server error' });   
    }
};

export const updateExpense = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid expense id' });
        }

        const expense = await getExpenseById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if(expense.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
        }

        const updatedExpense = await updateExpenseById(id, updates);
        return res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
        
    } catch (error) {
        console.error('Error in Update Expense controller:', error);
        return res.status(500).json({ message: 'Internal server error' });   
    }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid expense id' });
        }

        const expense = await getExpenseById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if(expense.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
        }

        await deleteExpenseById(id);
        return res.status(200).json({ message: 'Expense deleted successfully' });
        
    } catch (error) {
        console.error('Error in Delete Expense controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}