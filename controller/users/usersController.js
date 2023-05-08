const db = require('../../config/db');
const Appointment = require('../appointments/appointmentController');

module.exports.login = (req, res) => {
    if (req.isAuthenticated()) return res.render('home');
    res.render('users/login');
}

module.exports.register = (req, res) => {
    res.render('users/register');
}

module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).redirect('/');
        }
    });
}

module.exports.getMyAppointments =  async (req, res) => {
    const user_id = req.params.id;
    const result = await Appointment.getUserAppointments(user_id);
    const appointments = JSON.stringify(result);
    res.send(appointments);
}

module.exports.myAppointmentsPage = (req, res) => {
    const user_id = req.user.person_id;
    res.render('users/myAppointments', { user_id });
}