import express from 'express';

import { createUser, getUserByEmail } from '../db/users';
import { authentication as generateHash, random } from '../helpers';

// Login Controller
export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const user = await getUserByEmail(email)
            .select('+authentication.password +authentication.salt +authentication.sessionToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const expectedHash = generateHash(user.authentication.salt, password);
        if (expectedHash !== user.authentication.password) {
            return res.status(403).json({ message: 'Invalid password' });
        }

        const sessionToken = generateHash(random(), user._id.toString());
        user.authentication.sessionToken.push(sessionToken);

        await user.save();

        res.cookie('PROMISE_AUTH', sessionToken, { domain: 'localhost', path: '/' });

        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error in Login controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Register Controller
export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const salt = random();
        const user = await createUser({
            username,
            email,
            authentication: {
                salt,
                password: generateHash(salt, password),
            },
        });

        return res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error('Error in Register controller:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
