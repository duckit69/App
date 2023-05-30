const db = require('../../config/db');
const Doctor = require('../../model/doctor/doctorModel');
const Patient = require('../../model/patient/patientModel');

module.exports.checkDateForPatientAndDoctor = async function (req, res) {
    const { patient_id, doctor_id, date } = req.query;
    const myDate = new Date(date);
    myDate.setHours(myDate.getHours() + 1);
    const currentDate = new Date();
    if (myDate < currentDate) {
        console.log('myDate is in the past');
        const response = {
            status: 'error',
            message: 'The Requested Date is in the past'
        }
        res.send(response);
    } else if (myDate > currentDate) {
        console.log('myDate is in the future');
        const data = await checkIfDateIsValideForPatienTAndDoctor(doctor_id, patient_id, date);
        if (data.length === 0) {
            const response = {
                status: 'success',
                message: 'The Requested Date is valid'
            }
            res.send(response);
        } else {
            const response = {
                status: 'error',
                message: 'The Requested Date is Occupied'
            }
            res.send(response);
        }

    } else {
        console.log('myDate is the same as currentDate');
    }
    // const data = await checkIfDateIsValideForPatienTAndDoctor(doctor_id, patient_id, date);
    // res.send(data);
};
module.exports.createAppointment = async function (req, res) {
    console.log(req.body);
    const { doctor_id, patient_id, appointment_date, appointment_type, appointment_reason } = req.body;
    const result = await createAppointment(doctor_id, patient_id, appointment_date, appointment_type, appointment_reason);
    res.send(result);
}

module.exports.deleteAppointment = async (req, res) => {
    const appointment_id = req.params.id;
    await deleteAppointment(appointment_id);
    if (req.user.doctor_speciality) {
        return res.redirect('/users/doctor/dashboard');
    }
    res.redirect('/users/patient/dashboard');
}

module.exports.checkDateWithAppointmentId = async (req, res) => {
    const appointment_id = req.params.id;
    let { date } = req.body;
    const formDate = new Date(`${date}`);
    console.log("Form Date: " + formDate);
    const currentDate = new Date();
    console.log("Form Date: " + currentDate);
    // check if date is valid
    if (!(formDate > currentDate)) {
        console.log("Invalid Time");
        if (req.user.doctor_speciality) {
            return res.redirect('/users/doctor/dashboard');
        }
        return res.redirect('/users/patient/dashboard');
    }
    const result = await checkIfDateIsValideUsingId(appointment_id);
    const tmp_date = new Date(result[0].appointment_date);
    if (tmp_date.getDate() === formDate.getDate()) {
        if (tmp_date.getTime() === formDate.getDate()) {
            console.log("SAME DAY SAME TIME");
            if (req.user.doctor_speciality) {
                return res.redirect('/users/doctor/dashboard');
            }
            return res.redirect('/users/patient/dashboard');
        }
    }
    formDate.setHours(formDate.getHours() + 1);
    const formDate_db = formDate.toISOString();

    console.log("Diffrent Day/Time  Diffrent Time")
    // check if patient has an appointment
    const data = await checkIfDateIsValideForPatienTAndDoctor(result[0].doctor_id, result[0].patient_id, formDate_db);
    if (data.length > 0) {
        console.log("Occupied Date");
        if (req.user.doctor_speciality) {
            return res.redirect('/users/doctor/dashboard');
        }
        return res.redirect('/users/patient/dashboard');
    } else {
        const rows = await updateAppointment(appointment_id, formDate_db);
        console.log(rows);
        if (req.user.doctor_speciality) {
            return res.redirect('/users/doctor/dashboard');
        }
        return res.redirect('/users/patient/dashboard');
    }

}

module.exports.validateUsersForOneAppointment = async (req, res) => {
    const appointment_id = req.params.id;
    const user_id = req.user.person_id;
    // Check if users can access
    const users = await checkUsersIdForOneAppointment(appointment_id, user_id);
    if (!users) {
        if (req.user.doctor_speciality) {
            return res.redirect('/users/doctor/dashboard');
        }
        return res.redirect('/users/patient/dashboard');
    }
    else if (users.doctor_id == user_id || users.patient_id == user_id) {
        const doctor = await Doctor.getDoctorById(users.doctor_id);
        const patient = await Patient.getPatientById(users.patient_id);
        const recorded_values = await Patient.findAllSensorsForOnePatient(patient.person_id);
        const medical_history = await Patient.findMedicalHistoryForOnePatient(users.patient_id);
        const sensors = await Patient.findAllSensorsMostRecentDataForOnePatient(patient.person_id);
        const appointment = await getAppointment(appointment_id);
        const Evaluation = await Patient.evaluate(users.patient_id);
        if (req.user.person_id == doctor.person_id) {
            const sender = doctor;
            const receiver = patient;
            return res.render('appointment', { users, sender, receiver, medical_history, sensors, Evaluation, recorded_values, appointment });
        }else {
            const sender = patient;
            const receiver = doctor;
            return res.render('appointment', { users, sender, receiver, medical_history, sensors, Evaluation, recorded_values, appointment });
        }
    }
}

module.exports.getUserAppointments = async (user_id) => {
    const appointments = await getUserAppointment(user_id);
    return appointments;
}
async function getAppointment(appointment_id) {
    const { rows } = await db.query('select * from appointment where appointment_id = $1', [appointment_id]);
    return rows[0];
}
async function checkUsersIdForOneAppointment(appointment_id, user_id) {
    const { rows } = await db.query('select * from appointment where appointment_id = $1 and (doctor_id = $2 or patient_id = $2)', [appointment_id, user_id]);
    return rows[0];
}

async function checkIfDateIsValideForPatienTAndDoctor(doctor_id, patient_id, date) {
    const { rows } = await db.query('select * from appointment where (doctor_id = $1 or patient_id = $2) and appointment_date = $3', [doctor_id, patient_id, date]);
    return rows;
}
async function createAppointment(doctor_id, patient_id, appointment_date, appointment_type, appointment_reason) {
    return await db.query('insert into appointment(doctor_id, patient_id, appointment_date, appointment_type, appointment_reason) values($1, $2, $3, $4, $5)', [doctor_id, patient_id, appointment_date, appointment_type, appointment_reason]);
}
async function checkIfDateIsValideUsingId(appointment_id) {
    const { rows } = await db.query('select * from appointment where appointment_id = $1', [appointment_id]);
    return rows;
}
async function updateAppointment(appointment_id, date, time) {
    const { rows } = await db.query('UPDATE appointment SET appointment_date = $1 WHERE appointment_id = $2 returning appointment_id', [date, appointment_id]);
    return rows;
}

async function deleteAppointment(appointment_id) {
    return await db.query('DELETE FROM appointment WHERE appointment_id = $1', [appointment_id]);
}

async function getUserAppointment(user_id) {
    const { rows } = await db.query('SELECT * from appointment where doctor_id = $1 or patient_id = $1', [user_id]);
    return rows;
}