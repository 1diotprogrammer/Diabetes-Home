const express = require('express')

// Set your app up as an express app
const app = express()

// Set up to handle POST requests
app.use(express.json()) // needed if POST data is in JSON format
// app.use(express.urlencoded())  // only needed for URL-encoded input
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const exphbs = require('express-handlebars')

app.engine(
    'hbs',
    exphbs.engine({
        // configure Handlebars
        extname: 'hbs',
        helpers: {
            beFilled: (x) => x != -1,
            reverseArray: (array) => array.reverse(),
            isBgl: (x) => x === 'bgl',
            isWeight: (x) => x === 'weight',
            isDn: (x) => x === 'dn',
            isExercise: (x) => x === 'exercise',
            inInterval: function (min, num, max) {
                if (max >= num && min <= num) {
                    return true
                } else {
                    return false
                }
            },
            overEighty: x => x>=80
        },
    })
)

const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
require('./passport')(passport)
app.use(flash())
// Track authenticated users through login sessions
app.use(
    session({
        // The secret used to sign session cookies (ADD ENV VAR)
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        saveUninitialized: false,
        resave: false,
        cookie: { 
            sameSite: 'strict', httpOnly: true ,maxAge: 50000000 },
    })
)
app.use(passport.initialize())
app.use(passport.session())

app.set('view engine', 'hbs')

// link to our router
const patientRouter = require('./routes/patientRouter')
const clientRouter = require('./routes/clientRouter')

// middleware to log a message each time a request arrives at the server - handy for debugging
app.use((req, res, next) => {
    next()
})

app.use('/patient', patientRouter)
app.use('/client', clientRouter)

app.listen(process.env.PORT || 8080, () => {})
require('./models')
