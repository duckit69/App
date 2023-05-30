const express = require('express');
const route = express.Router();
const doctorRoute = require('../Doctor/doctorRoute');
const patientRoute = require('../Patient/patientRoute');
const User = require('../../controller/users/usersController');
const Utils = require('../../utils/utils');





route.get('/logout', User.logout);
route.get('/login', User.login);


route.use('/doctor',Utils.isLoggedIn, doctorRoute);
route.use('/patient', Utils.isLoggedIn, patientRoute);
route.get('/register', User.register);
route.use(Utils.checkAuthenticated);
route.use(Utils.checkPersonId);
route.get('/getAppointments/:id', User.getMyAppointments);
route.get('/myAppointments', Utils.isLoggedIn,  User.myAppointmentsPage);
module.exports = route;