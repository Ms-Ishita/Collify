import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please provide username, email, and password' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ msg: 'Email is already registered. Please login.' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'Username is already taken. Please choose another.' });
        }

        const user = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: role || 'student',
        });

        await user.save();

        const payload = {
            id: user._id,
            role: user.role,
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ 
            success: true,
            token, 
            role: user.role, 
            username: user.username 
        });
    } catch (err) {
        console.error('Register error:', err.message);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(400).json({ msg: `That ${field} is already in use. Please choose another.` });
        }
        res.status(500).json({ msg: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter both email and password' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        
        const payload = {
            id: user._id,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            success: true,
            token, 
            role: user.role, 
            username: user.username 
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: "Server error during login" });
    }
});

// GET /auth/me - get current logged-in user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ 
            success: true, 
            user, 
            username: user.username, 
            role: user.role 
        });
    } catch (err) {
        console.error('Auth/me error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

export default router;
