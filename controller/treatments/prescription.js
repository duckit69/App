const Treatment  = require('./treatmentController');
const db = require('../../config/db');

module.exports.createPrescriptionByPatient = async (medicine, dosage, date, doctor_id) => {
    const treatmentId = await Treatment.createTreatment(date, doctor_id);
    const { rows } = await db.query('INSERT INTO prescription(treatment_id, treatment_date) values($1, $2) returning treatment_id, prescription_id', [treatmentId, date]);
    const prescription_id = rows[0].prescription_id;
    await createMedicines(medicine, dosage, prescription_id);
    return rows[0].treatment_id;
}

module.exports.getPrescriptionsForOnePatient = async (patient_id) => {
    const prescriptionArray = await getPrescriptions(patient_id);
    return prescriptionArray;
}

async function getPrescriptions(patient_id) {
    // const { rows } = await db.query('select medical_history.*, prescription.*, treatment.* from prescription, treatment, patient, medical_history where patient.person_id = medical_history.patient_id and medical_history.treatment_id = treatment.treatment_id and treatment.treatment_id = prescription.treatment_id and patient.person_id = $1', [patient_id]);
    const { rows } = await db.query(' select mh.* , pr.* , tr.* from prescription pr, treatment tr, patient pt, medical_history mh, medicine me where mh.treatment_id = tr.treatment_id and tr.treatment_id = pr.treatment_id and pr.prescription_id = me.prescription_id and mh.patient_id = pt.person_id and pt.person_id = $1 GROUP BY mh.medical_history_id, pr.prescription_id, tr.treatment_id', [patient_id]);
    return rows;
}

async function createMedicines(medicine, dosage, prescription_id) {
    let length = null;
    if (Array.isArray(medicine)) {
        length = medicine.length;
    } else {
        length = 1;
    }
    
    for (let i = 0; i < length ; i++)  {
        const m = medicine[i];
        const d = dosage[i];
        await db.query('INSERT INTO medicine(prescription_id, medicine_name, medicine_dosage) values($1, $2, $3)',[prescription_id, m, d]);
    }
}