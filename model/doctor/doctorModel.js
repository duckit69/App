const db = require('../../config/db');
const bcrypt = require('bcrypt');

const salt = 10;

module.exports.registerDoctor = async (req, res) => {
    //fullname + gender + date + username + password + speciality
    let params = Object.values(req.body.user);
    const hashedPasswored = await bcrypt.hash(params[4], salt);
    params[4] = hashedPasswored;
    const { rows } = await db.query('INSERT INTO doctor(person_name, person_gender, person_birth_date, person_username, person_password, doctor_speciality) values($1, $2, $3, $4, $5, $6)', params);
    res.redirect('/users/login');
}

module.exports.getPatientByNameForOneDoctor = async (req, res) => {
    const { rows } = await findPatientByNameForOneDoctor(req.query.person_name, req.query.doctor_id);
    const html = rows.map(patient => {
        return `<a href="/users/patient_full_details/${patient.person_id}" class="search-result"><h5>${patient.person_name}</h5></a>`
    }).join('');
    res.send(html);
}
module.exports.doctorDashboard = async (req, res) => {
    const result = await findAllPatientForCeratinDoctor(req.user.person_id);
    const doctorObject = req.user;
    res.render('users/doctor/dashboard', { result, doctorObject});
}
module.exports.getPatientById = async (req, res) => {
    // person_id =  req.params.id
    const result = await findPatientFullDetailsById(req.params.id);
    const age = await db.query('SELECT EXTRACT(YEAR FROM age(person_birth_date)) as age from patient where person_id = $1', [req.params.id]);
    const recorded_data = await db.query('SELECT s.*, r.* from sensor s, recorded_data r, patient p where p.person_id = r.patient_id and r.sensor_id = s.sensor_id and p.person_id = $1', [req.params.id]);
    const patient_recorded_data = recorded_data.rows;
    res.render('users/doctor/patient_full_details', {result, age, patient_recorded_data});
}
async function findPatientByNameForOneDoctor(patient_name, doctor_id) {    
    return await db.query(`SELECT p.* FROM doctor d, patient p, treatment t, medical_history m WHERE t.doctor_id = d.person_id AND t.treatment_id = m.treatment_id AND m.patient_id = p.person_id AND d.person_id = ${doctor_id} AND p.person_name ILIKE '${patient_name}%' LIMIT 5;`);
}
async function findPatientFullDetailsById(person_id) {
    //get patient
    const result = await db.query('SELECT * FROM patient WHERE person_id = $1', [person_id]);
    const patient = result.rows;
    // get medical history
    const result1 = await db.query('SELECT * FROM medical_history m, patient p WHERE m.patient_id = p.person_id AND m.patient_id = $1', [person_id]);
    const medical_history = result1.rows;
    return {patient, medical_history}
}
async function findAllPatientForCeratinDoctor(person_id) {
    return await db.query('SELECT p.* FROM doctor d, patient p, treatment t, medical_history m WHERE t.doctor_id = d.person_id AND t.treatment_id = m.treatment_id AND m.patient_id = p.person_id AND d.person_id = $1', [person_id]);
}