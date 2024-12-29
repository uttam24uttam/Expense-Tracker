import express from "express";
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register Route
router.post('/register', async function (req, res) {
    try {
        const { email, password } = req.body;

        // checking if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json("Email already registered");
        }

        const newUser = new User(req.body);
        await newUser.save();

        res.send("User Registered Successfully");

    } catch (error) {
        res.status(500).json(error);
    }
});

// Login Route
router.post('/login', async function (req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json("Invalid email or password");
        }

        //comparing entered password with the hashed password
        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(400).json("Invalid email or password");
        }

        res.send(user)
    } catch (error) {
        res.status(500).json(error);
    }
});

export default router;


