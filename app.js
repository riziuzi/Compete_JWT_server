const express = require("express")
app = express()

// importing files
const cors = require("cors")
const mongoose = require("mongoose")
const { User } = require("./database")
const { hashSync, compareSync } = require('bcrypt');
const jwt = require("jsonwebtoken")
const passport = require("passport")
// const cookieParser = require('cookie-parser');
require("./passportConfig")

// using middlewares
db = "mongodb+srv://riziuzi:8rkI2Ecz3vsXuXw6@userscluster.ogfwcvn.mongodb.net/?retryWrites=true&w=majority"
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log("err"));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
})); app.use(express.json())     // to parse the incoming requset's JSON formatted string to JS object (accessed in the req.body)
app.use(express.urlencoded({ extended: true }))    // same as above and something?
app.use(passport.initialize());
// app.use(cookieParser());        // for parsing cookie


// GET
app.get("/", (req, res) => {
    res.send("Home")
})
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).send({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
        }
    })
})
app.get("/logout",(req, res, next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        return res.status(200).send({
            success : true,
            message : "Logged out successfully!"
        })
      });
})

// POST
app.post("/register", async (req, res) => {
    const { username, name, password } = req.body
    const user = await User.findOne({ username: username })               // await is necessary, as this line is skipped and the next if statement becomes true hueueueueue
    if (user) return res.status(400).send({ message: "user already exists" })
    const newUser = new User({
        name: name,
        username: username,
        password: hashSync(password, 10)
    })
    newUser.save().then((user) => {
        res.status(200).send({
            success: true,
            message: "User Registered",
            user: {
                _id: user._id,
                username: user.username
            }
        })
    })
})
app.post("/login", async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username: username })
    if (!user) return res.status(401).send({
        success: false,
        message: "NO user FOUND!!!!"
    })
    if (!compareSync(password, user.password)) return res.status(401).send({
        success: false,
        message: "Incorrect Password"
    })
    const payload = {
        username: user.username,
        id: user._id
    }
    const token = jwt.sign(payload, "Random string", { expiresIn: "1d" })
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // TO set the token in the user's local browser
    return res.status(200).send({
        success: true,
        message: "Logged in successfully!",
        token: "Bearer " + token
    })
})

// Listening
app.listen(3001, console.log("Started Listening and localhost:3001"))