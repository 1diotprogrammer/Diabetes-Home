const Client = require('../models/client')
const Patient = require('../models/patient')
const Note = require('../models/notes')
const NoteId = require('../models/noteId')
const recordController = require('../controllers/recordController')
const Customer = require('../models/customer')
const bcrypt = require('bcrypt')
const Data = require('../models/data')
//get the total patients' data list

//render login page
const logIn = (req, res) => {
    res.render('client_login.hbs', { layout: 'client_login', message: req.flash('message') })
}

//render logout page
const logOut = (req, res) => {
    req.logout()
    res.redirect('/client')
}

//client dashboard/ absent list display
const getDashboardById = async (req, res, next) => {
    try {
        const client = await Client.findById(req.params.client_id)
            .populate({
                path: 'customerRecord.customerId',
                populate: { path: 'data_record.dataId' },
            })
            .lean()
        if (!client) {
            return res.sendStatus(404)
        }
        //check which patient has not log in to the web app(have not filled theirs datas for today)
        var today = recordController.getTodayDate()
        var newDay = new Date(Date.UTC(today[0], today[1], today[2]))
        var absentList = new Array()
        var patientList = new Array()
        for (let i = 0; i < client.customerRecord.length; i++) {
            element = client.customerRecord[i]
            var lastdata =
                element.customerId.data_record[
                    element.customerId.data_record.length - 1
                ]
            if (element.customerId.data_record.length === 0) {
                absentList.push({
                    name: element.customerId.first_name,
                    patientId: element.customerId._id,
                    clientId: client._id
                })
            } else {
                if (
                    newDay.toDateString() ===
                    lastdata.dataId.date.toDateString()
                ) {
                } else {
                    absentList.push({
                        name: element.customerId.first_name,
                        patientId: element.customerId._id,
                        clientId: client._id
                    })
                }
                var length = element.customerId.data_record.length
                for (var j = length; j > 0; j--) {
                    var findData = await Data.findById(element.customerId.data_record[j - 1].dataId._id)
                    patientList.push({
                        client_id: client._id,
                        patient_id: element.customerId._id,
                        first_name: element.customerId.first_name,
                        last_name: element.customerId.last_name,
                        bgl_requested: element.customerId.bgl_requested,
                        weight_requested: element.customerId.weight_requested,
                        dn_requested: element.customerId.dn_requested,
                        exercise_requested: element.customerId.exercise_requested,
                        bgl_max: element.customerId.bgl_max,
                        bgl_min: element.customerId.bgl_min,
                        weight_max: element.customerId.weight_max,
                        weight_min: element.customerId.weight_min,
                        dn_max:element.customerId.dn_max,
                        dn_min: element.customerId.dn_min,
                        exercise_max: element.customerId.exercise_max,
                        exercise_min: element.customerId.exercise_min,
                        bgl: findData.bgl,
                        weight: findData.weight,
                        exercise:findData.exercise,
                        dn:findData.dn,
                        date: new Intl.DateTimeFormat('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }).format(findData.date)
                    })
                }
            }
        }
        //render handlebars
        res.render('client_detail_dashboard.hbs', {
            layout: 'client_dashboard',
            clinician: client,
            patientList: patientList,
            absent: absentList,
        })
    } catch (err) {
        return next(err)
    }
}

// render the overview page for specific patient
const getPersonalDetailById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)
            .populate(
                [{path: 'data_record.dataId'}, 
                {path: 'notes_record.noteId'}]
            ).lean()
        
        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }
        if( patient.data_record.length){
            latestdata = patient.data_record[patient.data_record.length - 1].dataId
            var bgl_init = true
            var weight_init = true
            var dn_init = true
            var exercise_init = true
            if(latestdata.bgl === -1){
                bgl_init = false
            }
            if(latestdata.weight === -1){
                weight_init = false
            }
            if(latestdata.dn === -1){
                dn_init = false
            }
            if(latestdata.exercise === -1){
                exercise_init = false
            }
            var init_checked = {bglItem: bgl_init, weightItem: weight_init, dnItem: dn_init, exerciseItem: exercise_init}
            var item = {data: latestdata, checkedItem: init_checked}
        }else{
            var bgl_init = false
            var weight_init = false
            var dn_init = false
            var exercise_init = false
            var init_checked = {bglItem: bgl_init, weightItem: weight_init, dnItem: dn_init, exerciseItem: exercise_init}
            var item = {data: false, checkedItem: init_checked}
        }
        var router = { clinicianId: client._id, patientId: patient._id }
        
        
        //render handlebars
        res.render('client_detail_overview.hbs', {
            layout: 'client_overview',
            oneItem: item,
            patientItem: patient,
            clientItem: client,
            router: router,
        })
    } catch (err) {
        return next(err)
    }
}

// render the note function and message function on overview page for specific patient
const insertNotesAndMessage = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)

        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }

        var today =recordController.getTodayDate()
        var newDay = new Date(Date.UTC(today[0], today[1], today[2]))

        if(req.body.input_messages){
            patient.message = req.body.messages
            patient.messageDate = newDay   
            await patient.save().catch((err) => res.send(err))
            var url = '/client/' + client._id + '/' + patient._id + '/overview'
            return res.redirect(url)
        }else{
            const newNote = new Note({
                date: newDay,
                note: req.body.notes,
            })

            await newNote.save().catch((err) => res.send(err))
            const newNoteId = new NoteId({ noteId: newNote._id })
            patient.notes_record.push(newNoteId)
            await patient.save().catch((err) => res.send(err))
            var url = '/client/' + client._id + '/' + patient._id + '/overview'
            return res.redirect(url)
        }
    } catch (err) {
        return next(err)
    }
}

// render note page/ get note for a patient
const getNotesById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)
            .populate({
                path: 'notes_record.noteId' ,
            }).lean()
        
        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }
        var dataList = new Array()
        var length = patient.notes_record.length
        for (i = length; i > 0; i--) {
            var findData = await Note.findById(patient.notes_record[i - 1].noteId._id)
            dataList.push({
                date: new Intl.DateTimeFormat('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }).format(findData.date),
                note: findData.note
            })
        }
        var router = { clinicianId: client._id, patientId: patient._id }
        //render handlebars
        res.render('client_detail_notes.hbs', {
            layout: 'client_notes',
            dataItem: dataList,
            patientItem: patient,
            clientItem: client,
            router: router,
        })
    } catch (err) {
        return next(err)
    }
}

//patient register page 
const getregisterData = async (req, res, next) => {
    try {
        const client = await Client.findById(req.params.client_id).lean()
        if (!client) {
            return res.sendStatus(404)
        }
        res.render('clinician_register.hbs', {
            layout: 'clinician_reg',
            clinician: client,
        })
    } catch (err) {
        return next(err)
    }
}

//render comment page/ get comments for a patient
const getCommentsById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)
            .populate({
                path: 'data_record.dataId',
            })
            .lean()

        const client = await Client.findById(req.params.client_id).lean()
        data_record = patient.data_record

        if (!patient) {
            return res.sendStatus(404)
        }
        var dataList = new Array()
        var length = patient.data_record.length
        for (i = length; i > 0; i--) {
            var findData = await Data.findById(patient.data_record[i - 1].dataId._id)
            dataList.push({
                date: new Intl.DateTimeFormat('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }).format(findData.date),
                bgl: findData.bgl,
                bgl_comment: findData.bgl_comment,
                weight: findData.weight,
                weight_comment: findData.weight_comment,
                dn: findData.dn,
                dn_comment: findData.dn_comment,
                exercise: findData.exercise,
                exercise_comment: findData.exercise_comment,
            })
        }
    
        var router = { clinicianId: client._id, patientId: patient._id }
        //render handlebars
        res.render('client_detail_comments.hbs', {
            layout: 'client_comments',
            dataItem: dataList,
            patientItem: patient,
            clientItem: client,
            router: router,
        })
    } catch (err) {
        return next(err)
    }
}

//render data page/ get all data of a patient
const getDataById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)
            .populate({
                path: 'data_record.dataId',
            })
            .lean()

        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }
        var dataList = new Array()
        var length = patient.data_record.length
        for (i = length; i > 0; i--) {
            var findData = await Data.findById(patient.data_record[i - 1].dataId._id)
            dataList.push({
                date: new Intl.DateTimeFormat('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }).format(findData.date),
                bgl: findData.bgl,
                bgl_comment: findData.bgl_comment,
                weight: findData.weight,
                weight_comment: findData.weight_comment,
                dn: findData.dn,
                dn_comment: findData.dn_comment,
                exercise: findData.exercise,
                exercise_comment: findData.exercise_comment,
                bgl_requested: patient.bgl_requested,
                weight_requested:patient.weight_requested,
                dn_requested: patient.dn_requested,
                exercise_requested: patient.exercise_requested,
                bgl_max: patient.bgl_max,
                bgl_min: patient.bgl_min,
                weight_max: patient.weight_max,
                weight_min: patient.weight_min,
                dn_max:patient.dn_max,
                dn_min: patient.dn_min,
                exercise_max: patient.exercise_max,
                exercise_min: patient.exercise_min,
            })
        }
        var router = { clinicianId: client._id, patientId: patient._id }
        //render handlebars
        res.render('client_detail_patientdata.hbs', {
            layout: 'client_patientdata',
            dataItem: dataList,
            patientItem: patient,
            clientItem: client,
            router: router,
        })
    } catch (err) {
        return next(err)
    }
}

//render the patient's thresholds
const getThreshold = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()

        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }
        var router = { clinicianId: client._id, patientId: patient._id }
        //render handlebars
        res.render('client_detail_personalization.hbs', {
            layout: 'client_personalization',
            patientItem: patient,
            clientItem: client,
            router: router,
        })
    } catch (err) {
        return next(err)
    }
}

//change the patient's thresholds
const insertThreshold = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)

        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }

        //update the available of the data
        if (req.body.bgl_check) {
            patient.bgl_requested = true
        } else {
            patient.bgl_requested = false
        }

        if (req.body.weight_check) {
            patient.weight_requested = true
        } else {
            patient.weight_requested = false
        }

        if (req.body.dn_check) {
            patient.dn_requested = true
        } else {
            patient.dn_requested = false
        }

        if (req.body.exercise_check) {
            patient.exercise_requested = true
        } else {
            patient.exercise_requested = false
        }

        //update the minimum and maximum of the data
        if (req.body.bgl_min) {
            patient.bgl_min = req.body.bgl_min
        }
        if (req.body.bgl_max) {
            patient.bgl_max = req.body.bgl_max
        }
        if (req.body.weight_max) {
            patient.weight_max = req.body.weight_max
        }
        if (req.body.weight_min) {
            patient.weight_min = req.body.weight_min
        }
        if (req.body.dn_max) {
            patient.dn_max = req.body.dn_max
        }
        if (req.body.dn_min) {
            patient.dn_min = req.body.dn_min
        }
        if (req.body.exercise_max) {
            patient.exercise_max = req.body.exercise_max
        }
        if (req.body.exercise_min) {
            patient.exercise_min = req.body.exercise_min
        }
        await patient.save().catch((err) => res.send(err))
        var url =
            '/client/' + client._id + '/' + patient._id + '/personalization'
        return res.redirect(url)
    } catch (err) {
        return next(err)
    }
}

//clinician register data
const insertregisterData = async (req, res, next) => {
    try {
        const client = await Client.findById(req.params.client_id)
        if (!client) {
            return res.sendStatus(404)
        }
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash("12345678", salt)

        var today = recordController.getTodayDate()
        var newDay = new Date(Date.UTC(today[0], today[1], today[2]))
        const newPatient = new Patient({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedpassword,
            date_of_birth: new Date(req.body.dob.replaceAll('-', '/')),
            bgl_requested: false,
            bgl_max: -1,
            bgl_min: -1,
            weight_requested: false,
            weight_max: -1,
            weight_min: -1,
            dn_requested: false,
            dn_max: -1,
            dn_min: -1,
            exercise_requested: false,
            exercise_max: -1,
            exercise_min: -1,
            message: '',
            percentage: 0,
            registerDate: newDay,
            role: 'patient',
            data_record: [],
            notes: [],
            darkmod: false,
            screenName: req.body.first_name,
            brief: 'nothing'
        })
        await newPatient.save().catch((err) => res.send(err))
        newCustomer = new Customer({ customerId: newPatient._id })
        client.customerRecord.push(newCustomer)
        await client.save().catch((err) => res.send(err))
        var total = client.totalCustomer + 1
        await Client.updateOne({_id: client._id}, {totalCustomer: total})
        var id = client._id
        var url = '/client/' + id + '/dashboard'
        return res.redirect(url)
    } catch (err) {
        return next(err)
    }
}

// render setup page for patient/ read infor
const getPersonalsetById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)
            .populate({
                path: 'data_record.dataId',
            })
            .lean()

        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }
        var router = { clinicianId: client._id, patientId: patient._id }
        //render handlebars
        res.render('client_detail_setup.hbs', {
            layout: 'client_setup',
            patientItem: patient,
            clientItem: client,
            router: router
        })
    } catch (err) {
        return next(err)
    }
}

// change details in setup page
const insertPersonalsetById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)

        const client = await Client.findById(req.params.client_id).lean()

        if (!patient) {
            return res.sendStatus(404)
        }

        patient.password = req.body.password
        await patient.save().catch((err) => res.send(err))
        var url = '/client/' + client._id + '/' + patient._id + '/overview'
        return res.redirect(url)
    } catch (err) {
        return next(err)
    }
}

// overall comments page  
const getOverallComments = async (req, res, next) => {
    try {
        const client = await Client.findById(req.params.client_id)
            .populate({
                path: 'customerRecord.customerId',
                populate: { path: 'data_record.dataId' },
            })
            .lean()
        if (!client) {
            return res.sendStatus(404)
        }

        var commentsList = new Array()

        for (let i = 0; i < client.customerRecord.length; i++) {
            element = client.customerRecord[i]
            var length = element.customerId.data_record.length
            for (j = length; j > 0; j--) {
                var findData = await Data.findById(element.customerId.data_record[j - 1].dataId._id)
                if (findData.bgl_comment != ''){
                    commentsList.push({
                        client_id: client._id,
                        client_first_name: client.first_name,
                        patient_id: element.customerId._id,
                        first_name: element.customerId.first_name,
                        last_name: element.customerId.last_name,
                        date: new Intl.DateTimeFormat('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }).format(findData.date),
                        comment: findData.bgl_comment
                    })
                }
                if (findData.weight_comment != '') {
                    commentsList.push({
                        client_id: client._id,
                        client_first_name: client.first_name,
                        patient_id: element.customerId._id,
                        first_name: element.customerId.first_name,
                        last_name: element.customerId.last_name,
                        date: new Intl.DateTimeFormat('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }).format(findData.date),
                        comment: findData.weight_comment
                    })
                }
                if(findData.dn_comment != '')  {
                    commentsList.push({
                        client_id: client._id,
                        client_first_name: client.first_name,
                        patient_id: element.customerId._id,
                        first_name: element.customerId.first_name,
                        last_name: element.customerId.last_name,
                        date: new Intl.DateTimeFormat('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }).format(findData.date),
                        comment: findData.dn_comment
                    })
                }
                if(findData.exercise_comment != ''){
                    commentsList.push({
                        client_id: client._id,
                        client_first_name: client.first_name,
                        patient_id: element.customerId._id,
                        first_name: element.customerId.first_name,
                        last_name: element.customerId.last_name,
                        date: new Intl.DateTimeFormat('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        }).format(findData.date),
                        comment: findData.dn_comment
                    })
                }
            }
        }
        
        var count = 0;
        var overall = new Array()
        overall.push([])
        var length = 0
        for(var i = 0; i < commentsList.length; i++){
            overall[length].push(commentsList[i])
            count++
            if (count === 4){
                overall.push([])
                length++
                count = 0
            }
        }
        while(1){
            if (count!= 4){
                overall[overall.length-1].push(0)
                count ++
            }else{
                break
            }
        }
        res.render('client_detail_overall_comment.hbs', {
            layout: 'client_overall_comment',
            clinician: client,
            overall: overall,
        })
    } catch (err) {
        return next(err)
    }
}

//render the "about diabetes" pages
const getDiabetes = (req, res) => {
    res.render('client_about_diabetes.hbs', { layout: 'about_dia' })
}

//render the "about this website" pages
const getWebsite = (req, res) => {
    res.render('client_about_website.hbs', { layout: 'about_web' })
}


module.exports = {
    getDiabetes,
    getWebsite,
    logIn,
    getDashboardById,
    getPersonalDetailById,
    insertNotesAndMessage,
    getNotesById,
    getCommentsById,
    getDataById,
    getThreshold,
    insertThreshold,
    insertregisterData,
    getregisterData,
    getPersonalsetById,
    insertPersonalsetById,
    getOverallComments,
    logOut
}
