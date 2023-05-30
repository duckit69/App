const express = require('express');
const route = express.Router();
const Appointment = require('../../controller/appointments/appointmentController');

const Utils = require('../../utils/utils');

route.get('/checkDate/search', Utils.checkAuthenticated, Appointment.checkDateForPatientAndDoctor);
route.post('/createAppointment', Utils.checkAuthenticated, Appointment.createAppointment);
route.get('/:id', Utils.checkAuthenticated, Appointment.validateUsersForOneAppointment);
route.put('/:id', Utils.checkAuthenticated, Appointment.checkDateWithAppointmentId);
route.delete('/:id', Utils.checkAuthenticated, Appointment.deleteAppointment);
module.exports = route;