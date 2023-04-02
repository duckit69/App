const db = require('../../config/db');

module.exports.checkDate = async function (req, res) {
    const { patient_id, doctor_id, date, time } = req.query;
    const result = await checkIfDateIsValide(doctor_id, patient_id, date, '14:30:00');
    const data = result.rows;
    console.log(data);
    res.send(data);
};
module.exports.createAppointment = async function (req, res) {
    const { doctor_id, patient_id, appointment_date, appointment_time, appointment_type, appointment_reason } = req.body;
    const result = await createAppointment(doctor_id, patient_id, appointment_date, appointment_time, appointment_type, appointment_reason);
    res.send(result);
}
async function checkIfDateIsValide(doctor_id, patient_id, date, time) {
    return await db.query('select * from appointment where (doctor_id = $1 or patient_id = $2) and appointment_date = $3 and appointment_time = $4', [doctor_id, patient_id, date, time]);
}
async function createAppointment(doctor_id, patient_id, appointment_date, appointment_time, appointment_type, appointment_reason) {
    return await db.query('insert into appointment(doctor_id, patient_id, appointment_date, appointment_time, appointment_type, appointment_reason) values($1, $2, $3, $4, $5, $6)',[doctor_id, patient_id, appointment_date, appointment_time, appointment_type, appointment_reason]);
}