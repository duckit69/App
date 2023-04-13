const Prescription = require('../../controller/treatments/prescription');
const Scanner = require('../../controller/treatments/scannerController');
const db  = require('../../config/db');

module.exports.addMedicalHistory = async (req, res) => {
    const patient_id = req.user.person_id;
    const { diagnosis, notes, date,treatment } = req.body;
    let treatment_id= null;
    if (treatment == 'prescription') {
        const { medicine, dosage } = req.body;
        treatment_id  = await Prescription.createPrescriptionByPatient(medicine, dosage, date);
    } else if (treatment == 'scanner') {
        const { originalname, path } = req.files[0]; 
        treatment_id = await Scanner.createScannerByPatient(originalname, path, date);
    }
    await createMedicalHistory(treatment_id, diagnosis, notes, patient_id);
    res.redirect('/users/patient/dashboard');
}



async function createMedicalHistory(treatment_id, diagnosis, notes, patient_id) {
    await db.query('INSERT INTO medical_history(treatment_id, patient_id, medical_history_diagnosis, medical_history_notes) values($1, $2, $3, $4)', [treatment_id, patient_id, diagnosis, notes]);
}
