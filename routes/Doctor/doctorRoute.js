const express = require('express');
const passport = require('../../config/passportConfig');

const route = express.Router();
const Doctor = require('../../model/doctor/doctorModel');
const utils  = require('../../utils/utils');

route.get('/dashboard', utils.checkAuthenticated, utils.checkDoctor, Doctor.doctorDashboard);
route.get('/search/patient', Doctor.getPatientByNameForOneDoctor);
route.get('/patient_full_details/:id', Doctor.getPatientById);
route.post('/register', Doctor.registerDoctor);
route.post('/login', passport.authenticate('doctor-login', {
    successRedirect: '/users/doctor/dashboard',
    failureRedirect: '/users/login'
}));

module.exports = route;