import express from 'express';

import {
    getCategoriesByUserId,
    createCategory as createCategoryInDb,
    updateCategoryById,
    deleteCategoryById,
    getCategoryById,
    getCategoryByNameAndUser
} from '../db/categories';

type AuthenticatedRequest = express.Request & {
    user: {
        _id: string;
    };
};

export const getCategories = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const userId = req.user._id;
        const categories = await getCategoriesByUserId(userId);
        return res.status(200).json({ categories });
    } catch (error) {
        console.error('Error in Get Categories controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const createCategory = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const userId = req.user._id;
        const { name, budget, color } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const existingCategory = await getCategoryByNameAndUser(name, userId);
        if (existingCategory) {
            return res.status(409).json({ message: 'Category with this name already exists' });
        }

        const category = await createCategoryInDb({ name, user: userId, budget: budget ?? null, color: color ?? '#6366f1' });
        return res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        console.error('Error in Create Category controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCategory = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const { id } = req.params;
        const { name, budget, color } = req.body;
        const updateData: Record<string, any> = { };

        if (name !== undefined && !name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        if(budget !== undefined) {
            if(typeof budget !== 'number' || budget < 0) {
                return res.status(400).json({ message: 'Invalid budget value' });
            }
        }

        if(color !== undefined) {
            updateData.color = color;
        }

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid category id' });
        }

        //Check Duplicate Category Name
        if(name !== undefined) {
            const existingCategory = await getCategoryByNameAndUser(name, req.user._id);
            if (existingCategory && existingCategory._id.toString() !== id) {
                return res.status(409).json({ message: 'Category with this name already exists' });
            }
            updateData.name = name;
        }

        if(budget !== undefined) updateData.budget = budget;

        if(Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const category = await updateCategoryById(id, updateData);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error in Update Category controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid category id' });
        }

        const category = await getCategoryById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await deleteCategoryById(id);
        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error in Delete Category controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
