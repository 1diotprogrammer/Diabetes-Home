const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Patient = require('./models/patient')
const Client = require('./models/client')

module.exports = (passport) => {
    // Serialize information to be stored in session/cookie
    passport.serializeUser((user, done) => {
        // Use id to serialize user
        done(null, { _id: user.id, role: user.role })
    })
    // When a request comes in, deserialize/expand the serialized information
    // back to what it was (expand from id to full user)
    passport.deserializeUser((loginMessgae, done) => {
        // Run database query here to retrieve user information
        // For now, just return the hardcoded user
        if (loginMessgae.role === 'patient') {
            Patient.findById(loginMessgae._id, (err, user) => {
                return done(err, user)
            })
        } else if (loginMessgae.role === 'clinician') {
            Client.findById(loginMessgae._id, (err, user) => {
                return done(err, user)
            })
        } else {
            return done(new Error('this user dont have role'), null)
        }
    })
    // Define local authentication strategy for Passport
    // http://www.passportjs.org/docs/downloads/html/#strategies
    passport.use(
        'patient-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
            },
            (req, email, password, done) => {
                process.nextTick(() => {
                    Patient.findOne({ email: email }, async (err, patient) => {
                        if (err) {
                            return done(err)
                        } else if (!patient) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    'message',
                                    'Wrong account or password'
                                )
                            )
                        } else if (!await bcrypt.compare( password, patient.password )) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    'message',
                                    'Wrong account or password'
                                )
                            )
                        } else {
                            return done(
                                null,
                                patient,
                                req.flash('message', 'Login')
                            )
                        }
                    })
                })
            }
        )
    )

    passport.use(
        'client-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true,
            },
            (req, email, password, done) => {
                process.nextTick(() => {
                    Client.findOne({ email: email }, async (err, client) => {
                        if (err) {
                            return done(err)
                        } else if (!client) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    'message',
                                    'Wrong account or password'
                                )
                            )
                        } else if (!await bcrypt.compare( password, client.password) ){
                            return done(
                                null,
                                false,
                                req.flash(
                                    'message',
                                    'Wrong account or password'
                                )
                            )
                        } else {
                            return done(
                                null,
                                client,
                                req.flash('message', 'Login')
                            )
                        }
                    })
                })
            }
        )
    )
}
