import express from 'express';

import { getExpensesByUserId } from '../db/expenses';
import { getCategoriesByUserId } from '../db/categories';
import { getDateRange } from '../utils/date';

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

        const dailyRange = getDateRange('daily');
        const weeklyRange = getDateRange('weekly');
        const monthlyRange = getDateRange('monthly');
        const yearlyRange = getDateRange('yearly');

        const expenseByCategory: Record<
            string,
            {
                budget: number;
                spend: number;
                dailyExpenses: number;
                weeklyExpenses: number;
                monthlyExpenses: number;
                yearlyExpenses: number;
                expenses: {
                    id: string;
                    amount: number;
                    date: Date;
                    note?: string;
                }[];
            }
        > = {};

        expenses.forEach(expense => {
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
                    dailyExpenses: 0,
                    weeklyExpenses: 0,
                    monthlyExpenses: 0,
                    yearlyExpenses: 0,
                    expenses: []
                };
            }

            const expenseDate = new Date(expense.date);

            // total spend
            expenseByCategory[categoryName].spend += expense.amount;

            // range-based spend
            if (expenseDate >= dailyRange.start && expenseDate <= dailyRange.end) {
                expenseByCategory[categoryName].dailyExpenses += expense.amount;
            }

            if (expenseDate >= weeklyRange.start && expenseDate <= weeklyRange.end) {
                expenseByCategory[categoryName].weeklyExpenses += expense.amount;
            }

            if (expenseDate >= monthlyRange.start && expenseDate <= monthlyRange.end) {
                expenseByCategory[categoryName].monthlyExpenses += expense.amount;
            }

            if (expenseDate >= yearlyRange.start && expenseDate <= yearlyRange.end) {
                expenseByCategory[categoryName].yearlyExpenses += expense.amount;
            }

            // push expense
            expenseByCategory[categoryName].expenses.push({
                id: expense._id.toString(),
                amount: expense.amount,
                date: expense.date,
                note: expense.note
            });
        });

        const calculateRangeExpense = (
            range: 'daily' | 'weekly' | 'monthly' | 'yearly'
        ) => {
            const { start, end } = getDateRange(range);

            return expenses
                .filter(exp => {
                    const date = new Date(exp.date);
                    return date >= start && date <= end;
                })
                .reduce((sum, exp) => sum + exp.amount, 0);
        };

        const dailyExpenses = calculateRangeExpense('daily');
        const weeklyExpenses = calculateRangeExpense('weekly');
        const monthlyExpenses = calculateRangeExpense('monthly');
        const yearlyExpenses = calculateRangeExpense('yearly');

        return res.status(200).json({
            totalBudget,
            totalExpenses,
            remainingBudget: totalBudget - totalExpenses,
            dailyExpenses,
            weeklyExpenses,
            monthlyExpenses,
            yearlyExpenses,
            expenseByCategory
        });
    } catch (error) {
        console.error('Error in Get Summary controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
