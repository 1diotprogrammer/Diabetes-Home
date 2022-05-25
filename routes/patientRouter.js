const express = require('express')

// create our Router object
const patientRouter = express.Router()

// require our controller
const patientController = require('../controllers/patientController')
const recordController = require('../controllers/recordController')
const passport = require('passport')

patientRouter.get('/', patientController.logIn)
patientRouter.post(
    '/',
    passport.authenticate('patient-login', {
        failureRedirect: '/patient',
        failureflash: true,
    }),
    function (req, res) {
        res.redirect('/patient/' + req.user._id + '/homepage')
    }
)
patientRouter.get('/:patient_id/darkmode', patientController.darkmode)

patientRouter.get('/logout', patientController .logOut)

patientRouter.get('/about_website', patientController.getWebsite)
patientRouter.get('/about_diabetes', patientController.getDiabetes)

patientRouter.get(
    '/:patient_id/homepage',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.getHomepageById
)

patientRouter.get(
    '/:patient_id/record',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    recordController.getDataByIdRecord
)

patientRouter.get(
    '/:patient_id/record/:datapage',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    recordController.getDetailData
)
patientRouter.post(
    '/:patient_id/record/:datapage',
    recordController.insertDataRecord
)

patientRouter.get(
    '/:patient_id/personal_detail',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.getPersonalDetail
)
patientRouter.post(
    '/:patient_id/personal_detail',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.insertPersonalDetail
)

patientRouter.get(
    '/:patient_id/leaderboard',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.getLeaderboard
)


patientRouter.get(
    '/:patient_id/resetpassword',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.resetPassword
)
patientRouter.post(
    '/:patient_id/resetpassword',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.insertResetPassword
)


patientRouter.get(
    '/:patient_id/recordhistory',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.gettodayRecordHistory
)

patientRouter.post(
    '/:patient_id/recordhistory',
    function patientLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        res.redirect('/patient')
    },
    patientController.insertRecordHistory
)

module.exports = patientRouter
