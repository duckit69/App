const db  = require('../../config/db');

module.exports.addMedicalHistory = async (req, res) => {
    const patient_id = req.query.patient_id;
    const { diagnosis, notes, date, medicine, dosage } = req.body;
    const { treatment_id }  = await createTreatment(date, medicine, dosage);
    await createMedicalHistory(treatment_id, diagnosis, notes, patient_id);
    res.redirect('/users/patient/dashboard');
}


async function createMedicalHistory(treatment_id, diagnosis, notes, patient_id) {
    await db.query('INSERT INTO medical_history(treatment_id, patient_id, medical_history_diagnosis, medical_history_notes) values($1, $2, $3, $4)', [treatment_id, patient_id, diagnosis, notes]);
}

async function createTreatment(date, medicine, dosage) {
    const { rows } = await db.query('INSERT INTO treatment(treatment_date, treatment_medicine, treatment_dosage) values($1, $2, $3) returning treatment_id',[date, medicine, dosage]);
    return rows[0];
}