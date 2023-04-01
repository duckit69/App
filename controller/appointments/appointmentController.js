const db = require('../../config/db');

module.exports.checkDate = async function(req, res){
    const { patient_id, doctor_id, date, time } = req.query;
    const  result  = await checkIfDateIsValide(doctor_id, patient_id, date, '14:30:00');
    const data = result.rows;
    console.log(data);
    res.send(data);
};

async function checkIfDateIsValide(doctor_id, patient_id, date, time){
    return await db.query('select * from appointment where (doctor_id = $1 or patient_id = $2) and appointment_date = $3 and appointment_time = $4', [doctor_id, patient_id, date, time]);
}