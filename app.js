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
db = "mongodb+srv://riziuzi:Ya1y1fCgI8Z5Wj0s@authenticationscluster.dcaj1z9.mongodb.net/?retryWrites=true&w=majority"
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log("err"));
app.use(cors({
    origin: 'https://compete-j0qb.onrender.com/',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}))
app.use(express.json())     // to parse the incoming requset's JSON formatted string to JS object (accessed in the req.body)
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
            _id: req.user._id,
            userId: req.user.userId,
        }
    })
})
// app.get("/logout",(req, res, next)=>{
//     req.logout(function(err) {
//         if (err) { return next(err); }
//         return res.status(200).send({
//             success : true,
//             message : "Logged out successfully!"
//         })
//       });
// })

// POST
app.post("/register", async (req, res) => {
    const { userId, name, password } = req.body
    const user = await User.findOne({ userId: userId })               // await is necessary, as this line is skipped and the next if statement becomes true hueueueueue
    if (user) return res.status(400).send({ message: "user already exists" })
    const newUser = new User({
        name: name,
        userId: userId,
        password: hashSync(password, 10)
    })
    newUser.save().then((user) => {
        res.status(200).send({
            success: true,
            message: "User Registered",
            user: {
                _id: user._id,
                userId: user.userId
            }
        })
    })
})
app.post("/login", async (req, res) => {
    const { userId, password } = req.body
    const user = await User.findOne({ userId: userId })
    if (!user) return res.status(401).send({
        success: false,
        message: "NO user FOUND!!!!"
    })
    if (!compareSync(password, user.password)) return res.status(401).send({
        success: false,
        message: "Incorrect Password"
    })
    const payload = {
        userId: user.userId,
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

const port = process.env.PORT || 3001
// Listening
app.listen(port, console.log("Started Listening and localhost:3001"))