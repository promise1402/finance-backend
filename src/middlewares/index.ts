import express from 'express';
import { get } from 'lodash';

import { getUserBySessionToken } from '../db/users';

export const isOwner =  async ( req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const { id } = req.params;
        const currentUserId = get(req, 'user._id') as string;
        if(!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized: No user identity found' });
        }

        if(currentUserId.toString() !== id) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
        }

        return next();
    } catch (error) {
        console.error('Error in isOwner middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });   
    }
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessionToken = req.cookies['PROMISE_AUTH'];
        if (!sessionToken) {
            return res.status(401).json({ message: 'Unauthorized: No session token provided' });
        }

        const existingUser = await getUserBySessionToken(sessionToken);
        if (!existingUser) {
            return res.status(401).json({ message: 'Unauthorized: Invalid session token' });
        }

        (req as any).user = {
            ...existingUser.toObject(),
            _id: existingUser._id.toString(),
        };

        return next();
    } catch (error) {
        console.error('Error in isAuthenticated middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};