const Patient = require('../models/patient')
const Record = require('../models/record')
const Data = require('../models/data')

// get the "record" by this function
const getDataByIdRecord = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id, {}).lean()
        if (!patient) {
            // no patient found in database
            return res.sendStatus(404)
        }
        var today = getTodayDate()
        var newDay = new Date(Date.UTC(today[0], today[1], today[2]))
        const newData = new Data({
            date: newDay,
            bgl: -1,
            bgl_comment: '',
            weight: -1,
            weight_comment: '',
            dn: -1,
            dn_comment: '',
            exercise: -1,
            exercise_comment: '',
        })
        if (patient.data_record.length == 0) {
            //check whether there is a data or not
        } else {
            //check whether today's data is created and stored in the database or not
            var dataRecord = patient.data_record
            var found = 0
            let element = dataRecord[dataRecord.length - 1]
            var data = await Data.findById(element.dataId).lean()
            if (
                data.date.getFullYear() === newDay.getFullYear() &&
                data.date.getMonth() === newDay.getMonth() &&
                data.date.getDate() === newDay.getDate()
            ) {
                found = 1
            }
            if (found == 1) {
                return res.render('patient_record.hbs', {
                    layout: 'patient_homepage',
                    patient: patient,
                    data: data,
                })
            }
        }
        // found person
        res.render('patient_record.hbs', {
            layout: 'patient_homepage',
            patient: patient,
            data: newData.toJSON(),
        })
    } catch (err) {
        return next(err)
    }
}

// get the four invidual pages in record function in patient
const getDetailData = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id).lean()
        if (!patient) {
            // no patient found in database
            return res.sendStatus(404)
        }
        var today = getTodayDate()
        var newDay = new Date(today[0], today[1], today[2])
        var correctFormDay = new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(newDay)
        //render different pages
        return res.render('patient_input_data.hbs', {
            layout: 'patient_record_data',
            patient: patient,
            date: correctFormDay.replaceAll(' ', '/'),
            exactPage: req.params.datapage,
        })
    } catch (err) {
        return next(err)
    }
}

// add an object to the database
const insertDataRecord = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.patient_id)
        if (!patient) {
            // no patient found in database
            return res.sendStatus(404)
        }
        var today = getTodayDate()
        var newDay = new Date(Date.UTC(today[0], today[1], today[2]))
        const newData = new Data({
            date: newDay,
            bgl: -1,
            bgl_comment: '',
            weight: -1,
            weight_comment: '',
            dn: -1,
            dn_comment: '',
            exercise: -1,
            exercise_comment: '',
        })
        if (patient.data_record.length == 0) {
            if (req.params.datapage === 'bgl') {
                newData.bgl = req.body.data
                newData.bgl_comment = req.body.Comment
            } else if (req.params.datapage === 'weight') {
                newData.weight = req.body.data
                newData.weight_comment = req.body.Comment
            } else if (req.params.datapage === 'dn') {
                newData.dn = req.body.data
                newData.dn_comment = req.body.Comment
            } else if (req.params.datapage === 'exercise') {
                newData.exercise = req.body.data
                newData.exercise_comment = req.body.Comment
            }

            await newData.save().catch((err) => res.send(err))
            newRecord = new Record({ dataId: newData._id })
            patient.data_record.push(newRecord)
            await patient.save().catch((err) => res.send(err))
            var Difference_In_Time =
                newDay.getTime() - patient.registerDate.getTime()
            var Difference_In_Days = (Difference_In_Time / (1000 * 3600 * 24)) + 1
            if (Difference_In_Days == 0) {
                await Patient.updateOne(
                    { _id: req.params.patient_id },
                    { percentage:  100  }
                )
            } else {
                percentage =
                    (patient.data_record.length / Difference_In_Days) * 100
                await Patient.updateOne(
                    { _id: req.params.patient_id },
                    { percentage: Math.round(percentage) }
                )
            }

            var id = patient._id
            var url = '/patient/' + id + '/record'
            return res.redirect(url)
        }
        var dataRecord = patient.data_record
        let element = dataRecord[dataRecord.length - 1]
        var data = await Data.findById(element.dataId).lean()
        if (
            data.date.getFullYear() === newDay.getFullYear() &&
            data.date.getMonth() === newDay.getMonth() &&
            data.date.getDate() === newDay.getDate()
        ) {
            //get today's data for the patient and update these information
            if (req.params.datapage === 'bgl') {
                await Data.updateOne(
                    { _id: data._id },
                    {
                        bgl: req.body.data,
                        bgl_comment: req.body.Comment,
                    }
                )
            } else if (req.params.datapage === 'weight') {
                await Data.updateOne(
                    { _id: data._id },
                    {
                        weight: req.body.data,
                        weight_comment: req.body.Comment,
                    }
                )
            } else if (req.params.datapage === 'dn') {
                await Data.updateOne(
                    { _id: data._id },
                    {
                        dn: req.body.data,
                        dn_comment: req.body.Comment,
                    }
                )
            } else if (req.params.datapage === 'exercise') {
                await Data.updateOne(
                    { _id: data._id },
                    {
                        exercise: req.body.data,
                        exercise_comment: req.body.Comment,
                    }
                )
            }
        } else {
            if (req.params.datapage === 'bgl') {
                newData.bgl = req.body.data
                newData.bgl_comment = req.body.Comment
            } else if (req.params.datapage === 'weight') {
                newData.weight = req.body.data
                newData.weight_comment = req.body.Comment
            } else if (req.params.datapage === 'dn') {
                newData.dn = req.body.data
                newData.dn_comment = req.body.Comment
            } else if (req.params.datapage === 'exercise') {
                newData.exercise = req.body.data
                newData.exercise_comment = req.body.Comment
            }

            await newData.save().catch((err) => res.send(err))
            newRecord = new Record({ dataId: newData._id })
            patient.data_record.push(newRecord)
            var Difference_In_Time =
                newDay.getTime() - patient.registerDate.getTime()
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24) + 1
            percentage = (patient.data_record.length / Difference_In_Days) * 100
            await patient.save().catch((err) => res.send(err))
            await Patient.updateOne(
                { _id: req.params.patient_id },
                { percentage: Math.round(percentage) }
            )
        }
        var id = patient._id
        var url = '/patient/' + id + '/record'
        return res.redirect(url)
    } catch (err) {
        return next(err)
    }
}

//get today's date in the form of "MM/Day/Year" and date in australia(melbourne)
function getTodayDate() {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = today.getMonth() //January is 0!
    var yyyy = today.getFullYear()
    var currentDate = new Date()
    var hours = currentDate.getHours()
    if (hours + 10 < 24) {
        today = [yyyy, mm, dd]
    } else {
        if (mm in [0, 2, 4, 6, 7, 9, 11]) {
            var date = today.getDate() + 1
            if (date < 32) {
                today = [yyyy, mm, date]
            } else {
                today = [yyyy, mm + 1, 1]
            }
        } else {
            if (mm in [1]) {
                var date = today.getDate() + 1
                if (date < 29) {
                    today = [yyyy, mm, date]
                } else {
                    today = [yyyy, mm + 1, 1]
                }
            } else {
                var date = today.getDate() + 1
                if (date < 31) {
                    today = [yyyy, mm, date]
                } else {
                    today = [yyyy, mm + 1, 1]
                }
            }
        }
    }
    return today
}

module.exports = {
    getDataByIdRecord,
    getDetailData,
    insertDataRecord,
    getTodayDate,
}
