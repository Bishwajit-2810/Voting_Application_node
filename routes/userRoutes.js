const express = require('express');
const router = express.Router();
const User = require("../models/user")
const { jwtMiddleware, generateToken } = require("../jwt");

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId)
        return user.role === 'admin'

    } catch (err) {
        return false
    }

}

router.post("/signup", async (req, res) => {

    try {
        const data = req.body
        const newUser = new User(data);


        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate voting Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.votingCardNumber)) {
            return res.status(400).json({ error: 'voting Card Number must be exactly 12 digits' });
        }

        // Check if a user with the same voting Card Number already exists
        const existingUser = await User.findOne({ votingCardNumber: data.votingCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same voting Card Number already exists' });
        }


        const response = await newUser.save();
        console.log("response data saved")

        const payLoad = {
            id: response.id,
        }
        const token = generateToken(payLoad)
        res.status(200).json({ response: response, token: token });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })

    }
})

router.post('/login', async (req, res) => {
    try {
        const { votingCardNumber, password } = req.body
        const user = await User.findOne({ votingCardNumber: votingCardNumber })
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'invalid username or password' })
        }
        const payLoad = {
            id: user.id,
        }
        const token = generateToken(payLoad)
        res.json({ token })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })
    }
})


router.get("/profile", jwtMiddleware, async function (req, res) {
    try {
        const userData = req.user
        const userDataById = await User.findById(userData.id)
        res.status(200).json(userDataById)
    } catch (err) {
        res.status(500).json({ error: "internal server error" })
    }
})


router.put('/profile/password', jwtMiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const { currentPass, newPass } = req.body;

        const userById = await User.findById(userData.id)

        if (!userById) {
            return res.status(404).json({ error: 'user not found' })
        }

        if (!(await User.comparePassword(currentPass))) {
            return res.status(401).json({ error: 'invalid username or password' })
        }
        User.password = newPass
        await User.save()

        res.json(userById)
        console.log("password updated")
        res.status(200).json({ message: "password updated" })


    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })
    }
})

router.get("/all", jwtMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user doesn't have admin role" })
        }
        const response = await User.find()
        return res.status(200).json(response)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })
    }

})



module.exports = router

