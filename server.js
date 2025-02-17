const express = require("express")
const app = express();
const db = require("./db")
const bodyParser = require('body-parser');
app.use(bodyParser.json());
require('dotenv').config()
const { jwtMiddleware } = require("./jwt");

app.get("/", function (req, res) {
    res.send("welcome to Voting System")
})

const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes');
const Candidate = require("./models/candidate");

app.use("/user", userRoutes)
app.use("/candidate", candidateRoutes)






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`)
})