const express = require('express');
const route = express.Router();
const doctorRoute = require('../Doctor/doctorRoute');
const patientRoute = require('../Patient/patientRoute');
const User = require('../../controller/users/usersController');
const Utils = require('../../utils/utils');


route.use('/doctor',doctorRoute);
route.use('/patient', patientRoute);

route.get('/logout', User.logout);
route.get('/login', User.login);

route.get('/register', User.register);
route.get('/getAppointments/:id', User.getMyAppointments);
route.get('/myAppointments', User.myAppointmentsPage);
module.exports = route;