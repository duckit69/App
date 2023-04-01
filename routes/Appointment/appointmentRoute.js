const express = require('express');
const route = express.Router();
const Appointment = require('../../controller/appointments/appointmentController');

route.get('/checkDate/search', Appointment.checkDate);

module.exports = route;