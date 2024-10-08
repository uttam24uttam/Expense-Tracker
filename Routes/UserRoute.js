import express from "express";
import User from '../models/user.js';


const router = express.Router()


router.post('/login', async function (req, res) {
    try {
        const result = await User.findOne({ email: req.body.email, password: req.body.password })
        if (result) {
            res.send(result)
        }
        else {
            res.status(500).json("Error")
        }

    } catch (error) {
        res.status(500).json(error)

    }

})


router.post('/register', async function (req, res) {
    try {
        const newuser = new User(req.body)
        await newuser.save()
        res.send("User Registered Succesfully")

    } catch (error) {
        res.status(500).json(error)

    }

})

export default router;
