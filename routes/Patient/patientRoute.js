const express = require('express');
const passport = require('../../config/passportConfig');

const route = express.Router();
const Patient = require('../../model/patient/patientModel');
const utils  = require('../../utils/utils');


route.get('/dashboard', utils.checkAuthenticated, Patient.patientDashboard);
route.get('/search/doctor', Patient.getDoctorByNameForOnePatient);
route.get('/allDoctors', Patient.getAllDoctors);
route.post('/register', Patient.registerPatient);
route.post('/login', passport.authenticate('patient-login', {
    successRedirect: '/users/patient/dashboard',
    failureRedirect: '/users/login'
}));
route.get('/doctor_full_details/:id', utils.checkAuthenticated,Patient.getMedicalHistoryWithSpecificDoctor);

module.exports = route;