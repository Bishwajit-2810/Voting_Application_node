const jwt = require("jsonwebtoken")

const jwtMiddleware = async (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).json({ error: 'Invalid Token' })
    }

    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ error: "Unauthorized" })

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()

    } catch (err) {
        console.log(err)
        res.status(401).json({ error: 'invalid token' })
    }
}

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 20000 })
}

module.exports = { jwtMiddleware, generateToken }