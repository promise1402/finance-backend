import express from 'express';

import { getCategoriesByUserId, getCategoryById } from '../db/categories';
import { getExpensesByUserId } from '../db/expenses';
import { getDateRange, RangeType } from '../utils/date';

type AuthenticatedRequest = express.Request & {
    user: {
        _id: string;
    };
};

export const getCategorySummary = async (
    req: AuthenticatedRequest,
    res: express.Response) => {
        try {
            const userId = req.user._id;

            const { categoryId } = req.params;
            if (!categoryId || Array.isArray(categoryId)) {
                return res.status(400).json({ message: 'Invalid category id' });
            }
            
            const rawRange = req.query.range;
            const range = typeof rawRange === 'string' ? rawRange : 'monthly'; //default to monthly if not provided

            //validating range
            if(!['daily', 'weekly', 'monthly', 'yearly'].includes(range as string)) {
                return res.status(400).json({ message: 'Invalid range value' });
            }

            const category = await getCategoryById(categoryId);

            if (!category || category.user.toString() !== userId.toString()) {
                return res.status(404).json({ message: 'Category not found' });
            }

            const { start, end } = getDateRange(range as RangeType);

            const expenses = await getExpensesByUserId(userId).where({
                category: categoryId,
                date: { $gte: start, $lte: end }
            });

            const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);

            const budget = category.budget ?? 0;
            const remainingBudget = budget - totalSpend;
            const percentageUsed = budget > 0 ? (totalSpend / budget) * 100 : 0;

            return res.status(200).json({
                category: {
                    id: category._id,
                    name: category.name,
                    budget: budget},

                    range,
                    totalSpend,
                    remainingBudget,
                    percentageUsed,
                    expenses: expenses.map(expense => ({
                        id: expense._id,
                        amount: expense.amount,
                        note: expense.note,
                        date: expense.date
                    }))
            });
        } catch (error) {
            console.error('Error in Get Category Summary controller:', error);
            return res.status(500).json({ message: 'Internal server error' });   
        }
    }