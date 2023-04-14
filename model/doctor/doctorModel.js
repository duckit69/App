const db = require('../../config/db');
const bcrypt = require('bcrypt');

const Patient = require('../patient/patientModel');

const salt = 10;

module.exports.registerDoctor = async (req, res) => {
    //fullname + gender + date + username + password + speciality
    const { name, date, gender, phone, speciality, username, password } = req.body;
    // let params = Object.values(req.body.user);
    let params = [ name, gender, date, phone, username, password, speciality ];
    const hashedPasswored = await bcrypt.hash(params[5], salt);
    params[5] = hashedPasswored;
    const { rows } = await db.query('INSERT INTO doctor(person_name, person_gender, person_birth_date, person_phone, person_username, person_password, doctor_speciality) values($1, $2, $3, $4, $5, $6, $7)', params);
    res.redirect('/users/login');
}

module.exports.getPatientByNameForOneDoctor = async (req, res) => {
    const { rows } = await findPatientByNameForOneDoctor(req.query.person_name, req.query.doctor_id);
    const html = rows.map(patient => {
        return `<a href="#" class="search-result btn btn-light"><h5>${patient.person_name}</h5></a><div class="d-none d-flex justify-content-center gap-1 infoCard">
        <a href="/users/doctor/patient_full_details/${patient.person_id}"
            class="btn btn-sm btn-primary text-white fw-bold mt-2 patient-ids">Visit Profile</a>
        <a href="#" class="btn btn-sm btn-info startChat text-white fw-bold mt-2"
            data-patient-id=${patient.person_id} data-patient-name=${patient.person_name}>Send a
            message</a>
    </div>`
    }).join('');
    res.send(html);
}
module.exports.doctorDashboard = async (req, res) => {
    const result = await findAllPatientForCeratinDoctor(req.user.person_id);
    const doctorObject = req.user;
    const myAppointments = await findMyUpComingAppointments(req.user.person_id);
    res.render('users/doctor/dashboard', { result, doctorObject, myAppointments });
}
//should not this be in patient model ? Hmm
module.exports.getPatientById = async (req, res) => {
    // person_id =  req.params.id
    const patient_id = req.params.id;
    const result = await findPatientFullDetailsById(patient_id);
    const Evaluation = await Patient.evaluate(patient_id);
    const age = await db.query('SELECT EXTRACT(YEAR FROM age(person_birth_date)) as age from patient where person_id = $1', [req.params.id]);
    const recorded_data = await db.query('SELECT s.*, r.* from sensor s, recorded_data r, patient p where p.person_id = r.patient_id and r.sensor_id = s.sensor_id and p.person_id = $1', [req.params.id]);
    const patient_recorded_data = recorded_data.rows;
    const {person_id} = req.user;
    const doctor_id = person_id;
    res.render('users/doctor/patient_full_details', {result, age, patient_recorded_data, doctor_id, Evaluation});
}

module.exports.getDoctorById= async (doctor_id) => {
    const doctor = await findDoctorById(doctor_id);
    return doctor;
}

async function findDoctorById(doctor_id) {
    const { rows } = await db.query('select * from doctor where person_id = $1', [doctor_id]); 
    return rows[0];
}

async function findPatientByNameForOneDoctor(patient_name, doctor_id) {    
    return await db.query(`SELECT DISTINCT p.* FROM doctor d, patient p, treatment t, medical_history m WHERE t.doctor_id = d.person_id AND t.treatment_id = m.treatment_id AND m.patient_id = p.person_id AND d.person_id = ${doctor_id} AND p.person_name ILIKE '${patient_name}%' LIMIT 5;`);
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
    return await db.query('SELECT DISTINCT p.* FROM doctor d, patient p, treatment t, medical_history m WHERE t.doctor_id = d.person_id AND t.treatment_id = m.treatment_id AND m.patient_id = p.person_id AND d.person_id = $1', [person_id]);
}

async function findMyUpComingAppointments(doctor_id) {
    const { rows } = await db.query(`select distinct a.*, p.person_name from appointment a, doctor d, patient p where a.patient_id = p.person_id and a.doctor_id = ${doctor_id} and a.appointment_date >= CURRENT_DATE order by appointment_date ASC`);
    return rows;
}