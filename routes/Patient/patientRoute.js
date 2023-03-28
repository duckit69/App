const express = require('express');
const passport = require('../../config/passportConfig');

const route = express.Router();
const Patient = require('../../model/patient/patientModel');
const utils  = require('../../utils/utils');

route.get('/dashboard', utils.checkAuthenticated, Patient.patientDashboard);

route.post('/register/patient', Patient.registerPatient);
route.post('/login/patient', passport.authenticate('patient-login', {
    successRedirect: '/users/patient/dashboard',
    failureRedirect: '/users/login'
}));

module.exports = route;