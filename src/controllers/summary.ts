import express from 'express';

import { getExpensesByUserId } from '../db/expenses';
import { getCategoriesByUserId } from '../db/categories';
import { getDateRange, RangeType } from '../utils/date';

type AuthenticatedRequest = express.Request & {
    user: {
        _id: string;
    };
};

export const getSummary = async (
    req: AuthenticatedRequest,
    res: express.Response
) => {
    try {
        const userId = req.user._id;

        const rawRange = req.query.range;
        const rawDate = req.query.date;

        const range: RangeType = ['daily', 'weekly', 'monthly', 'yearly'].includes(rawRange as string)
            ? (rawRange as RangeType)
            : 'monthly';

        const anchor = rawDate ? new Date(rawDate as string) : new Date();
        if (isNaN(anchor.getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        const [expenses, categories] = await Promise.all([
            getExpensesByUserId(userId).populate('category', 'name'),
            getCategoriesByUserId(userId)
        ]);

        const totalBudget = categories.reduce(
            (sum, category) => sum + (category.budget ?? 0),
            0
        );

        const totalExpenses = expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        const categoryMap: Record<string, { name: string; budget: number }> = {};

        categories.forEach(category => {
            categoryMap[category._id.toString()] = {
                name: category.name,
                budget: category.budget ?? 0
            };
        });

        const { start, end } = getDateRange(range, anchor);

        const filteredExpenses = expenses.filter(exp => {
            const date = new Date(exp.date);
            return date >= start && date <= end;
        });

        const periodTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        const expenseByCategory: Record<
            string,
            {
                budget: number;
                spend: number;
                expenses: {
                    id: string;
                    amount: number;
                    date: Date;
                    note?: string;
                }[];
            }
        > = {};

        filteredExpenses.forEach(expense => {
            let categoryName = 'Uncategorized';
            let categoryBudget = 0;

            if (
                typeof expense.category === 'object' &&
                expense.category !== null &&
                '_id' in expense.category
            ) {
                const categoryId = expense.category._id.toString();
                const category = categoryMap[categoryId];

                if (category) {
                    categoryName = category.name;
                    categoryBudget = category.budget;
                }
            }

            if (!expenseByCategory[categoryName]) {
                expenseByCategory[categoryName] = {
                    budget: categoryBudget,
                    spend: 0,
                    expenses: []
                };
            }

            expenseByCategory[categoryName].spend += expense.amount;
            expenseByCategory[categoryName].expenses.push({
                id: expense._id.toString(),
                amount: expense.amount,
                date: expense.date,
                note: expense.note
            });
        });

        return res.status(200).json({
            range,
            anchor: anchor.toISOString(),
            totalBudget,
            totalExpenses,
            remainingBudget: totalBudget - totalExpenses,
            periodTotal,
            expenseByCategory,
            expenses: filteredExpenses.map(e => ({
                id: e._id.toString(),
                amount: e.amount,
                note: e.note,
                date: e.date,
                category: e.category,
            })),
        });
    } catch (error) {
        console.error('Error in Get Summary controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};