const db = require('../../config/db');
const bcrypt = require('bcrypt');

const salt = 10;

module.exports.patientDashboard = async (req, res) => {
    const result = await db.query('select d.* from doctor d, treatment t, medical_history m, patient p where d.person_id = t.doctor_id and t.treatment_id = m.treatment_id and m.patient_id = p.person_id and p.person_id = $1;', [req.user.person_id]);
    console.log(req.user.person_id);
    const rows = result.rows;
    const patientObject = req.user;
    res.render('users/patient/dashboard', { rows, patientObject });
};

module.exports.registerPatient = async (req, res) => {
    // //fullname + gender + date + username + password + phone
    const { name, gender, date, phone, ATCD, smokeState, cigarettePerDay, IRC, sedentary, sportsMinutesPerDay, alchool, alchoolConsomation, username, password } = req.body.user;
    const params = [name, password, gender, date, phone, ATCD, smokeState, cigarettePerDay, IRC, sedentary, sportsMinutesPerDay, alchool, alchoolConsomation, username];
    const hashedPasswored = await bcrypt.hash(params[1], salt);
    params[1] = hashedPasswored;
    await db.query('INSERT INTO patient(person_name, person_password, person_gender, person_birth_date, person_phone, patient_atcd, patient_smokestate, patient_cigaretteConsomation, patient_irc, patient_sedentary, patient_sportminutesperday, patient_alchoolstate, patient_alchoolconsomation, person_username) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', params);
    res.redirect('/users/login');
}

module.exports.getMedicalHistoryWithSpecificDoctor = async (req, res) => {
    const {person_id} = req.user;
    const medicalHistory  = await findMedicalHistoryWithSpecificDoctor(req.params.id, person_id);
    const appointment = await findAppointmentWithSpecificDoctor(req.params.id, person_id);
    const patient_id = req.user.person_id;
    res.render('users/patient/show', {medicalHistory, appointment, patient_id});
}

// API CALL
module.exports.getDoctorByNameForOnePatient = async (req, res) => {
    const { rows } = await findDoctorByNameForOnePatient(req.query.person_name, req.query.patient_id);
    const html = rows.map(doctor => {
        return `<a href="/users/patient_full_details/${doctor.person_id}" class="search-result btn btn-light"><h5>${doctor.person_name}</h5></a>`
    }).join('');
    res.send(html);
}

module.exports.getAllDoctors = async (req, res) => {
    const doctorsArray = await findAllDoctors();
    res.render('users/patient/allDoctors', { doctorsArray } );
}

async function findAllDoctors() {
    const { rows } = await db.query('SELECT DISTINCT * FROM doctor');
    return rows;
}

async function findDoctorByNameForOnePatient(doctor_name, patient_id) {    
    return await db.query(`SELECT DISTINCT d.* FROM doctor d, patient p, treatment t, medical_history m WHERE t.doctor_id = d.person_id AND t.treatment_id = m.treatment_id AND m.patient_id = p.person_id AND p.person_id = ${patient_id} AND d.person_name ILIKE '${doctor_name}%' LIMIT 5;`);
}

async function findMedicalHistoryWithSpecificDoctor(doctor_id, patient_id) {
    const { rows } = await db.query('select d.doctor_speciality, d.person_name as doctor_name, m.* from doctor d, treatment t, medical_history m, patient p where d.person_id = t.doctor_id and t.treatment_id = m.treatment_id and m.patient_id = p.person_id and p.person_id = $1 and d.person_id = $2;', [patient_id, doctor_id]);
    return rows;
}

async function findAppointmentWithSpecificDoctor(doctor_id, patient_id) {
    const { rows } = await db.query('SELECT * from appointment where doctor_id = $1 and patient_id = $2', [doctor_id, patient_id]);
    return rows;
}