const express = require('express');
const route = express.Router();
const doctorRoute = require('../Doctor/doctorRoute');
const patientRoute = require('../Patient/patientRoute');
const User = require('../../controller/users/usersController');

route.use('/doctor', doctorRoute);
route.use('/patient', patientRoute);

route.get('/login', User.login);

route.get('/register', User.register);

module.exports = route;