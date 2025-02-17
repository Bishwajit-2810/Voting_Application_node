const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Person = require("./models/user")


//authentication
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        // console.log(username, password)
        const user = await Person.findOne({ username: username })
        if (!user) {
            done(null, false, { message: 'Incorrect username.' })
        }
        const isPasswordMatch = await user.comparePassword(password)
        if (isPasswordMatch) {
            return done(null, user)
        }
        else {
            done(null, false, { message: 'Incorrect password.' })
        }
    } catch (err) {
        return done(err)
    }
}))



module.exports = passport