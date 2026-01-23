import express from 'express';

import { deleteUserById, getUser, getUserById } from '../db/users';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUser();
        return res.status(200).json({ users });
    } catch (error) {
        console.error('Error in Get All Users controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const deletedUser = await deleteUserById(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error in Delete User controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUser = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;
        const {username} = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({message: 'Invalid user id'});
        }

        if(!username) {
            return res.status(400).json({message: 'Username is required'});
        }
        
        const user = await getUserById(id);
        user.username = username;
        await user.save();
        return res.status(200).json({message: 'User updated successfully', user});
        
    } catch (error) {
        console.error('Error in Update User controller:', error);
        return res.status(500).json({ message: 'Internal server error' });    
    }
}