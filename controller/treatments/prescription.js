const Treatment  = require('./treatmentController');
const db = require('../../config/db');

module.exports.createPrescriptionByPatient = async (medicine, dosage, date) => {
    const treatmentId = await Treatment.createTreatment(date);
    const { rows } = await db.query('INSERT INTO prescription(treatment_id, treatment_date, prescription_medicine, prescription_dosage) values($1, $2, $3, $4) returning treatment_id', [treatmentId, date, medicine, dosage]);
    return rows[0].treatment_id;
}

module.exports.getPrescriptionsForOnePatient = async (patient_id) => {
    const prescriptionArray = await getPrescriptions(patient_id);
    return prescriptionArray;
}

async function getPrescriptions(patient_id) {
    const { rows } = await db.query('select medical_history.*, prescription.*, treatment.* from prescription, treatment, patient, medical_history where patient.person_id = medical_history.patient_id and medical_history.treatment_id = treatment.treatment_id and treatment.treatment_id = prescription.treatment_id and patient.person_id = $1', [patient_id]);
    return rows;
}