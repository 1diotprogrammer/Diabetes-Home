// link to model
const Data = require('../models/data')
const Patient = require('../models/patient')
const recordController = require('../controllers/recordController')
const bcrypt = require('bcryptjs/dist/bcrypt')

//render the login page
const logIn = (req, res) => {
    res.render('login.hbs', { layout: 'patient_login', message:req.flash('message') })
}

//render the logout page
const logOut = (req, res) => {
    req.logout()
    res.redirect('/patient')
}

//render the "about diabetes" pages
const getDiabetes = (req, res) => {
    res.render('about_diabetes.hbs', { layout: 'about_dia' })
}

//render the "about this website" pages
const getWebsite = (req, res) => {
    res.render('about_this_website.hbs', { layout: 'about_web' })
}

// get the homepage by this function
const getHomepageById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        if (!patient) {
            // no author found in database
            return res.sendStatus(404)
        }
        // found person
        var today = recordController.getTodayDate()
        var newDay = new Date(Date.UTC(today[0], today[1], today[2]))
        var Difference_In_Time =
                newDay.getTime() - patient.registerDate.getTime()
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24) + 1
        percentage = (patient.data_record.length / Difference_In_Days) * 100
        if(percentage){
            
        }else{
            percentage = 0
        }
        await Patient.updateOne(
            { _id: req.params.patient_id },
            { percentage: Math.round(percentage) }
        )
        res.render('patient_homepage.hbs', {
            layout: 'patient_homepage',
            patient: patient,
        })
    } catch (err) {
        return next(err)
    }
}

//go the patient' detail page
const getPersonalDetail = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        if (!patient) {
            // no author found in database
            return res.sendStatus(404)
        }
        res.render('patient_detail.hbs', {
            layout: 'patient_homepage',
            patient: patient,
        })
    } catch (err) {
        return next(err)
    }
}

// change detail in the patient' detail  and save data to MongoDb
const insertPersonalDetail = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        if (!patient) {
            // no author found in database
            return res.sendStatus(404)
        }
        if(req.body.screen){
            await Patient.updateOne({ _id: req.params.patient_id }, {screenName: req.body.screen})
        }
        if (req.body.brief){
            await Patient.updateOne({ _id: req.params.patient_id }, {brief: req.body.brief})
        }if (req.body.dob) {
            console.log(req.body.dob)
            var date = new Date(req.body.dob.replaceAll('-', '/'))
            console.log(date)
            await Patient.updateOne({ _id: req.params.patient_id }, {date_of_birth: date})
        }
        return res.redirect('back')
    } catch (err) {
        return next(err)
    }
}

// render leaderboard page in patinent
const getLeaderboard = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        const patientRank = await Patient.find()
            .sort({ percentage: -1 })
            .limit(5)
        if (!patient) {
            // no author found in database
            return res.sendStatus(404)
        }
        var maxment = 5
        var rankList = []
        for (var i = 0; i < maxment; i++) {
            if (i >= patientRank.length) {
                continue
            } else {
                jason = {
                    first_name: patientRank[i].screenName,
                    percentage: patientRank[i].percentage,
                    exist:  true 
                }
                rankList.push(jason)
            }
        }
        length = rankList.length
        for (let index = 5; index > length; index --) {
            jason = {
                first_name: null,
                percentage: null,
                exist:  false
            }
            rankList.push(jason)
        }
        res.render('patient_leaderboard.hbs', {
            layout: 'patient_leaderboard',
            patient: patient,
            firstRank: rankList[0],
            secondRank: rankList[1],
            thirdRank: rankList[2],
            fourthRank: rankList[3],
            fifthRank: rankList[4],
        })
    } catch (err) {
        return next(err)
    }
}

//read the rencent day data for patient in patient history page
const gettodayRecordHistory = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)
            .populate({
                path: 'data_record.dataId',
            })
            .lean()
        
        //render handlebars
        var datarecordlength = patient.data_record.length
        if(datarecordlength){
            var dataId = patient.data_record[patient.data_record.length - 1].dataId
            var todayData = await Data.findById(dataId).lean()
            var today = new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(todayData.date)
            res.render('patient_history.hbs', {
                layout: 'patient_his',
                patient: patient,
                todayData: todayData,
                today: today,
                notFound: 0,
            })
            }else{
            var today = recordController.getTodayDate()
            var newDay = new Date(today[0], today[1], today[2])
            var today = new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(newDay)
            res.render('patient_history.hbs', {
                layout: 'patient_his',
                patient: patient,
                todayData: todayData,
                today: today ,
                notFound: 1,
            })
        }
    } catch (err) {
        return next(err)
    }
}

//check the data for a chosen day in patient history page
const insertRecordHistory = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        if (!patient) {
            // no author found in database
            return res.sendStatus(404)
        }
        var date = new Date(req.body.date.replaceAll('-', '/'))
        var data = patient.data_record
        var datarecordlength = patient.data_record.length
        if(!datarecordlength){
            return res.render('patient_history.hbs', {
                layout: 'patient_his',
                patient: patient,
                today: req.body.date,
                notFound: 1,
            })
        }
        var dataId = patient.data_record[patient.data_record.length - 1].dataId
        var todayData = await Data.findById(dataId).lean()
        for (let i = 0; i < data.length; i++) {
            const recordData = await Data.findById(data[i].dataId).lean()
            if (
                recordData.date.getFullYear() === date.getFullYear() &&
                recordData.date.getMonth() === date.getMonth() &&
                recordData.date.getDate() === date.getDate()
            ) {

                var today = new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(recordData.date)
                return res.render('patient_history.hbs', {
                    layout: 'patient_his',
                    patient: patient,
                    todayData: recordData,
                    today:today,
                    notFound: 0,
                })
            }
        }
        res.render('patient_history.hbs', {
            layout: 'patient_his',
            patient: patient,
            newData: todayData,
            today: req.body.date,
            notFound: 1,
        })
    } catch (err) {
        return next(err)
    }
}

//reset password page
const resetPassword = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        //render handlebars
        res.render('patient_resetpassword.hbs', {
            layout: 'patient_reset_password',
            patient: patient,
        })
    } catch (err) {
        return next(err)
    }
}
// change detail in the patient' detail  and save data to MongoDb
const insertResetPassword = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        if (!patient) {
            // no author found in database
            return res.sendStatus(404)
        }
        var message = "success"
        if(!await bcrypt.compare( req.body.oldpass, patient.password)){
            message = "wrong password"
            return  res.render('patient_resetpassword.hbs', {
                layout: 'patient_reset_password',
                patient: patient,
                message: message
            })
        }else {
            if (req.body.newpass != req.body.conpass ) {
                message = "different new password"
                return  res.render('patient_resetpassword.hbs', {
                    layout: 'patient_reset_password',
                    patient: patient,
                    message: message
                })
            }
            if (req.body.newpass.length < 8) {
                message = "too short password"
                return  res.render('patient_resetpassword.hbs', {
                    layout: 'patient_reset_password',
                    patient: patient,
                    message: message
                })
            }
        }
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(req.body.newpass, salt)
        await Patient.updateOne(
            { _id: req.params.patient_id },
            { password: hashedpassword }
        )
        res.render('patient_resetpassword.hbs', {
            layout: 'patient_reset_password',
            patient: patient,
            message: message
        })
    } catch (err) {
        return next(err)
    }
}

//darkmode function
const darkmode = async (req, res, next) => {
    try{
        const patient = await Patient.findById(req.params.patient_id).lean()
        if (!patient) {
            // no author found in database
            return res.sendStatus(404)
        }
        if (patient.darkmod){
            await Patient.updateOne({_id:req.params.patient_id}, {darkmod: false })
        }else{
            await Patient.updateOne({_id:req.params.patient_id}, {darkmod: true })
        }
        
        var id = patient._id
        var url = '/patient/' + id + '/homepage'
        return res.redirect(url)
    }catch (err) {
        return next(err)
    }
}
   
module.exports = {
    getWebsite,
    getDiabetes,
    logIn,
    getHomepageById,
    getPersonalDetail,
    insertPersonalDetail,
    getLeaderboard,
    insertRecordHistory,
    gettodayRecordHistory,
    logOut,
    resetPassword,
    insertResetPassword,
    darkmode
}
