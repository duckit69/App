const db = require('../../config/db');
const bcrypt = require('bcrypt');
const Patient = require('./patientModel');
const Doctor = require('../doctor/doctorModel');
const MH = require('./patientModel');
const { he } = require('faker/lib/locales');
const salt = 10;

module.exports.patientDashboard = async (req, res) => {
    console.log("PersonId: " + req.user.person_id)
    const result = await db.query('select d.* from doctor d, treatment t, medical_history m, patient p where d.person_id = t.doctor_id and t.treatment_id = m.treatment_id and m.patient_id = p.person_id and p.person_id = $1;', [req.user.person_id]);
    const sensors = await Patient.findAllSensorsMostRecentDataForOnePatient(req.user.person_id);
    const recorded_values = await Patient.findAllSensorsForOnePatient(req.user.person_id);
    const appointments = await findMyUpComingAppointments(req.user.person_id);
    const medical_history = await MH.findMedicalHistoryForOnePatient(req.user.person_id);
    const doctors = result.rows;
    const patientObject = req.user;
    const Evaluation = await evaluatePatient(req.user.person_id);

    res.render('users/patient/dashboard', { doctors, patientObject, appointments, medical_history, Evaluation, sensors, recorded_values });
};

module.exports.registerPatient = async (req, res) => {
    // //fullname + gender + date + username + password + phone
    const { name, gender, date, phone, username, password, height, weight, sedentary, atcd, smokestate, alchoolstate } = req.body;
    let flag = false;
    atcd.forEach(element => {
        if (element.toLowerCase() == 'yes'){
            flag = true;
        }
    })
    const params = [name, password, gender, date, phone, username, height, weight, sedentary, flag, smokestate, alchoolstate];
    const hashedPasswored = await bcrypt.hash(params[1], salt);
    params[1] = hashedPasswored;
    await db.query('INSERT INTO patient(person_name, person_password, person_gender, person_birth_date, person_phone, person_username, patient_height, patient_weight, patient_sedentary, patient_atcd, patient_cigaretteConsomation, patient_alchoolconsomation) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', params);
    res.redirect('/users/login');
}

module.exports.getMedicalHistoryWithSpecificDoctor = async (req, res) => {
    const { person_id } = req.user;
    const medicalHistory = await findMedicalHistoryWithSpecificDoctor(req.params.id, person_id);
    const appointment = await findAppointmentWithSpecificDoctor(req.params.id, person_id);
    const doctor = await findDoctorById(req.params.id);
    const patient_id = req.user.person_id;
    res.render('users/patient/show', { medicalHistory, appointment, patient_id, doctor });
}

module.exports.getPatientData = async (req, res) => {
    const patient = await findPatientById(req.user.person_id);
    res.render('users/patient/patientProfile', {patient});
}
module.exports.updatePatientData = async (req, res) => {
    const {cigarette, alchool, workout, height, weight} = req.body;
    const patient_id = req.user.person_id;
    await updatePatient(patient_id, cigarette, alchool, workout, height, weight);
    res.redirect('/users/patient/dashboard');
}

// API CALL
module.exports.getDoctorByNameForOnePatient = async (req, res) => {
    const result = await findDoctorByNameForOnePatient(req.query.person_name, req.query.patient_id);
    const html = result.map(doctor => {
        return `<a href="/users/patient_full_details/${doctor.person_id}" class="search-result btn btn-light"><h5>${doctor.person_name}</h5></a>`
    }).join('');
    res.send(html);
}


module.exports.getSensors = async (req, res) => {
    const sensors = await findAllSensorsForOnePatient(req.query.patient_id);
    res.send({ sensors });
}

module.exports.getAllAppointments = async (req, res) => {
    const appointments = await findMyAppointments(req.user.person_id);
    res.send({ appointments })
}

module.exports.evaluate = async (patient_id) => {
    return await evaluatePatient(patient_id);
}

module.exports.getPatientById= async (patient_id) => {
    const patient = await findPatientById(patient_id);
    return patient;
}

async function findPatientById(patient_id) {
    const { rows } = await db.query('select * from patient where person_id = $1', [patient_id]); 
    return rows[0];
}

module.exports.findMedicalHistoryForOnePatient = async function findMedicalHistoryForOnePatient(patient_id) {
    const { rows } = await db.query('SELECT DISTINCT m.* from medical_history m, patient p, treatment t where p.person_id = m.patient_id and m.treatment_id = t.treatment_id and p.person_id = $1', [patient_id]);
    return rows;
}

async function findMyUpComingAppointments(patient_id) {
    const { rows } = await db.query(`select a.*, d.person_name from appointment a, doctor d where a.doctor_id = d.person_id and patient_id = ${patient_id} and a.appointment_date >= CURRENT_DATE order by appointment_date ASC`);
    // const rows  = await db.query('select a.*, d.person_name from appointment a, doctor d where a.doctor_id = d.person_id and a.patient_id = $1 and a.appointment_date >= CURRENT_DATE order by a.appointment_date ASC', [patient_id]);
    return rows;
}
module.exports.findAllSensorsForOnePatient = async function findAllSensorsForOnePatient(patient_id) {
    const { rows } = await db.query('select * from recorded_data where patient_id = $1 and recorded_data_value is not null order by recorded_data_date DESC', [patient_id]);
    return rows;
}

module.exports.findAllSensorsMostRecentDataForOnePatient = async function findAllSensorsMostRecentDataForOnePatient(patient_id) {
    const { rows } = await db.query('SELECT s.*, p.*, rd.recorded_data_value FROM recorded_data rd JOIN ( SELECT sensor_id, MAX(recorded_data_date) AS max_date FROM recorded_data WHERE recorded_data_value IS NOT NULL GROUP BY sensor_id ) sdm ON rd.sensor_id = sdm.sensor_id AND rd.recorded_data_date = sdm.max_date JOIN sensor s ON rd.sensor_id = s.sensor_id JOIN patient p ON rd.patient_id = p.person_id WHERE rd.patient_id = $1', [patient_id]);
    return rows;
}

module.exports.getAllDoctors = async (req, res) => {
    const doctorsArray = await Doctor.getAllDoctors();
    res.render('users/patient/allDoctors', {doctorsArray});
}

async function updatePatient(patient_id, cigarette, alchool, workout, height, weight) {
    const param = [cigarette, alchool, workout, height, weight, patient_id];
    return await db.query('UPDATE patient set patient_cigaretteconsomation = $1, patient_alchoolconsomation = $2, patient_sedentary = $3, patient_height = $4, patient_weight = $5 where person_id = $6', param);
}


async function findDoctorByNameForOnePatient(doctor_name, patient_id) {
    const { rows } = await db.query(`SELECT DISTINCT d.* FROM doctor d, patient p, treatment t, medical_history m WHERE t.doctor_id = d.person_id AND t.treatment_id = m.treatment_id AND m.patient_id = p.person_id AND p.person_id = ${patient_id} AND d.person_name ILIKE '${doctor_name}%' LIMIT 5;`);
    return rows;
}

async function findMedicalHistoryWithSpecificDoctor(doctor_id, patient_id) {
    const { rows } = await db.query('select d.doctor_speciality, d.person_name as doctor_name, m.* from doctor d, treatment t, medical_history m, patient p where d.person_id = t.doctor_id and t.treatment_id = m.treatment_id and m.patient_id = p.person_id and p.person_id = $1 and d.person_id = $2;', [patient_id, doctor_id]);
    return rows;
}

async function findAppointmentWithSpecificDoctor(doctor_id, patient_id) {
    const { rows } = await db.query('SELECT * from appointment where doctor_id = $1 and patient_id = $2', [doctor_id, patient_id]);
    return rows;
}

async function findDoctorById(doctor_id) {
    const { rows } = await db.query('SELECT * FROM doctor WHERE person_id = $1', [doctor_id]);
    return rows[0];
}

async function countCardioVascularRiskFactors(patient_id) {
    let counter = 0;
    const factors = {};
    const gender = await getGender(patient_id);
    const age = await getAge(patient_id);
    const ATCD = await getATCD(patient_id);
    const cigarettePerDay = await getSmokeState(patient_id);
    const cupPerDay = await getDrinkState(patient_id);
    const minutesPerDay = await getSidentarite(patient_id);
    const sensors = await Patient.findAllSensorsMostRecentDataForOnePatient(patient_id);
    sensors.forEach(element => {
        if(element.sensor_type == 'SugarSensor') {
            const value = parseFloat(element.recorded_data_value.slice(0, 3));
            if (value > 1.2) {
                counter++;
                factors['SugarLevel'] = value;
            }
        } 
    })
    if (gender == 'MALE') {
        factors['gender'] = gender;
        counter++;
        if (age > 50) {
            factors['age'] = age;
            counter++;
        }
    }
    if (gender == 'FEMALE')
        if (age > 60) counter++;
    if (ATCD.atcd) {
        counter++;
        factors['atcd'] = ATCD.atcd;
    }
    
    if (cigarettePerDay.cigaretteperday > 10) {
        counter++;
        factors['smoke'] = cigarettePerDay.cigaretteperday;
    }
    if (cupPerDay > 3) {
        counter++;
        factors['drink'] = cupPerDay;
    }
    if (parseInt(minutesPerDay) < 30) {
        counter++;
        factors['workout'] = minutesPerDay;
    }
    const result = {counter, factors};
    return result;
}

async function getAge(patient_id) {
    const { rows } = await db.query('select EXTRACT(year from AGE(current_date, person_birth_date)) as age from patient where person_id = $1', [patient_id]);
    return rows[0].age;
}
async function getGender(patient_id) {
    const { rows } = await db.query('select person_gender as gender from patient where person_id = $1', [patient_id]);
    return rows[0].gender;
}
async function getATCD(patient_id) {
    const { rows } = await db.query('select patient_atcd as ATCD from patient where person_id = $1', [patient_id]);
    return rows[0];
}

async function getSmokeState(patient_id) {
    const { rows } = await db.query('select patient_cigaretteconsomation as cigarettePerDay from patient where person_id=$1', [patient_id]);
    return rows[0];
}

async function getSidentarite(patient_id) {
    const { rows } = await db.query('select patient_sedentary as minutesPerDay from patient where person_id=$1', [patient_id]);
    return rows[0].minutesperday;
}

async function getDrinkState(patient_id) {
    const { rows } = await db.query('select patient_alchoolconsomation as cupPerDay from patient where person_id=$1', [patient_id]);
    return rows[0].cupperday;
}

async function evaluatePatient(patient_id) {
    const riskFactors = await countCardioVascularRiskFactors(patient_id);
    const { counter, factors } = riskFactors;
    let riskClass = null;
    if (counter < 1) {
        riskClass = 'NO RISK';
    } else if (counter == 1) {
        riskClass = 'LOW RISK'
    } else if (counter == 2) {
        riskClass = 'MODERATE RISK'
    } else {
        riskClass = 'HIGH RISK';
    }
    const answer = {
        counter,
        riskClass,
        factors
    }
    return answer;
}