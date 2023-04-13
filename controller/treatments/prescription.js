const Treatment  = require('./treatmentController');
const db = require('../../config/db');

module.exports.createPrescriptionByPatient = async (medicine, dosage, date) => {
    const treatmentId = await Treatment.createTreatment(date);
    const { rows } = await db.query('INSERT INTO prescription(treatment_id, treatment_date, prescription_medicine, prescription_dosage) values($1, $2, $3, $4) returning treatment_id', [treatmentId, date, medicine, dosage]);
    return rows[0].treatment_id;
}