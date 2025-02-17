const express = require('express');
const router = express.Router();
const User = require("../models/user")
const Candidate = require("../models/candidate")
const { jwtMiddleware, generateToken } = require("../jwt");

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId)
        return user.role === 'admin'

    } catch (err) {
        return false
    }

}

router.get('/', jwtMiddleware, async (req, res) => {
    try {

        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user doesn't have admin role" })
        }
        const response = await Candidate.find()
        if (!response) {
            res.status(404).json({ error: "candidates not found" })
        }
        console.log("all candidate data")
        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })
    }
})


router.post("/", jwtMiddleware, async (req, res) => {

    try {
        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user doesn't have admin role" })
        }
        const data = req.body
        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();
        console.log("response data saved")
        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })

    }
})


router.put('/:candidateId', jwtMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user doesn't have admin role" })
        }
        const candidateId = req.params.candidateId
        const updatedCandidateData = req.body

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true
        })

        if (!response) {
            res.status(404).json({ error: "person not found" })
        }
        console.log("candidate data updated")
        res.status(200).json(response)

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })
    }
})

router.delete("/:candidateId", jwtMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user doesn't have admin role" })
        }
        const candidateId = req.params.candidateId
        const response = await Candidate.findByIdAndDelete(candidateId)
        if (!response) {
            res.status(404).json({ error: "Candidate not found" })
        }
        res.status(200).json({ message: "candidate delete successful" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })


    }
})


router.post('/vote/:candidateId', jwtMiddleware, async (req, res) => {
    const candidateId = req.params.candidateId
    const userId = req.user.id
    try {
        const user = await User.findById(userId)
        const candidate = await Candidate.findById(candidateId)
        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" })
        }
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        if (user.role == 'admin') {
            return res.status(403).json({ message: 'admin is not allowed' });
        }
        if (user.isVoted) {
            return res.status(400).json({ error: "user cannot vote twice" })
        }

        candidate.votes.push({ user: userId })
        candidate.voteCount++
        await candidate.save()

        user.isVoted = true
        await user.save()

        return res.status(200).json({ message: "vote done successfully" })


    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "internal server error" })
    }

})

router.get('/vote/count', async (req, res) => {
    try {
        const candidate = await Candidate.find().sort({ voteCount: 'desc' })

        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
        res.status(200).json({
            voteRecord
        })


    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })
    }
})

router.get("/all", async (req, res) => {
    try {
        const candidate = await Candidate.find()

        const allRecord = candidate.map((data) => {
            return {
                name: data.name,
                age: data.age,
                party: data.party
            }
        })

        return res.status(200).json(allRecord)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "internal server error" })
    }
})
module.exports = router

