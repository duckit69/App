const express = require('express');
const passport = require('../../config/passportConfig');

const route = express.Router();
const Patient = require('../../model/patient/patientModel');
const utils  = require('../../utils/utils');
const Doctor = require('../../model/doctor/doctorModel')

route.get('/dashboard', utils.checkAuthenticated, Patient.patientDashboard);
route.get('/search/doctor', Patient.getDoctorByNameForOnePatient);
route.get('/allDoctors', Patient.getAllDoctors);
route.get('/patientProfile', Patient.getPatientData);
route.post('/register', Patient.registerPatient);
route.post('/login', passport.authenticate('patient-login', { successRedirect: '/users/patient/dashboard', failureRedirect: '/users/login'}));
route.put('/:id', Patient.updatePatientData);
route.get('/doctor_full_details/:id', utils.checkAuthenticated,Patient.getMedicalHistoryWithSpecificDoctor);

module.exports = route;