const db = require('../../config/db');
const bcrypt = require('bcrypt');

const salt = 10;

module.exports.patientDashboard = (req, res) => res.render('users/patient/dashboard');

module.exports.registerPatient = async (req, res) => {
    //fullname + gender + date + username + password + phone
    let params = Object.values(req.body.user);
    const hashedPasswored = await bcrypt.hash(params[4], salt);
    params[4] = hashedPasswored;
    const { rows } = await db.query('INSERT INTO patient(person_name, person_gender, person_birth_date, person_username, person_password, patient_phone) values($1, $2, $3, $4, $5, $6)', params);
    res.redirect('/users/login');
}
