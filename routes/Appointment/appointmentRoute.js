const express = require('express');
const route = express.Router();
const Appointment = require('../../controller/appointments/appointmentController');

route.get('/checkDate/search', Appointment.checkDateForPatientAndDoctor);
route.post('/createAppointment', Appointment.createAppointment);
route.get('/:id', Appointment.validateUsersForOneAppointment);
route.put('/:id', Appointment.checkDateWithAppointmentId);
route.delete('/:id', Appointment.deleteAppointment);
module.exports = route;