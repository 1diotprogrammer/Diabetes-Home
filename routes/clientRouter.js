const express = require('express')
const passport = require('passport')
// create our Router object
const clientRouter = express.Router()

// require our controller
const clientController = require('../controllers/clientController')

clientRouter.get('/', clientController.logIn)
clientRouter.post(
    '/',
    passport.authenticate('client-login', {
        failureRedirect: '/client',
        failureflash: true,
    }),
    function (req, res) {
        res.redirect('/client/' + req.user._id + '/dashboard')
    }
)

clientRouter.get('/logout', clientController.logOut)


clientRouter.get('/about_website', clientController.getWebsite)
clientRouter.get('/about_diabetes', clientController.getDiabetes)


clientRouter.get(
    '/:client_id/dashboard',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getDashboardById
)
//individual patient overview page
clientRouter.get(
    '/:client_id/:patient_id/overview',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getPersonalDetailById
)
clientRouter.post(
    '/:client_id/:patient_id/overview',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.insertNotesAndMessage
)
//individual patient data page
clientRouter.get(
    '/:client_id/:patient_id/data',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getDataById
)
//individual patient notes page
clientRouter.get(
    '/:client_id/:patient_id/notes',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getNotesById
)
//individual patient comments page
clientRouter.get(
    '/:client_id/:patient_id/comments',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getCommentsById
)

clientRouter.get(
    '/:client_id/overallcomments',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getOverallComments
)

clientRouter.get(
    '/:client_id/:patient_id/personalization',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getThreshold
)
clientRouter.post(
    '/:client_id/:patient_id/personalization',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.insertThreshold
)

clientRouter.get(
    '/:client_id/registerpatient',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getregisterData
)
clientRouter.post(
    '/:client_id/registerpatient',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.insertregisterData
)

clientRouter.get(
    '/:client_id/:patient_id/setup',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.getPersonalsetById
)
clientRouter.post(
    '/:client_id/:patient_id/setup',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/client')
    },
    clientController.insertPersonalsetById
)
// export the router
module.exports = clientRouter
