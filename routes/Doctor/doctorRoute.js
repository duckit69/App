const express = require('express');
const passport = require('../../config/passportConfig');

const route = express.Router();
const Doctor = require('../../model/doctor/doctorModel');
const utils  = require('../../utils/utils');

route.get('/dashboard', utils.checkAuthenticated, utils.checkDoctor, Doctor.doctorDashboard);
route.get('/search/patient', utils.checkAuthenticated ,utils.checkDoctor,Doctor.getPatientByNameForOneDoctor);
route.get('/patient_full_details/:id', utils.checkAuthenticated, utils.checkDoctor,Doctor.getPatientById);
route.post('/register', Doctor.registerDoctor);
route.post('/login', passport.authenticate('doctor-login', {
    successRedirect: '/users/doctor/dashboard',
    failureRedirect: '/users/login'
}));

module.exports = route;