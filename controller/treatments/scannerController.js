const Treatment  = require('./treatmentController');
const db = require('../../config/db');

module.exports.createScannerByPatient = async (originalname, path, date) => {
    const treatmentId = await Treatment.createTreatment(date, doctor_id);
    const { rows } = await db.query('INSERT INTO scanner(treatment_id, treatment_date, image_url, image_name) values($1, $2, $3, $4) returning treatment_id', [treatmentId, date, path, originalname]);
    return rows[0].treatment_id;
}

module.exports.getScannersForOnePatient = async (patient_id) => {
    const scannerArray = await getScanners(patient_id);
    return scannerArray;
}

async function getScanners(patient_id) {
    const { rows } = await db.query('select medical_history.*, scanner.*, treatment.* from scanner, treatment, patient, medical_history where patient.person_id = medical_history.patient_id and medical_history.treatment_id = treatment.treatment_id and treatment.treatment_id = scanner.treatment_id and patient.person_id = $1', [patient_id]);
    return rows;
}