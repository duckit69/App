const Prescription = require('../../controller/treatments/prescription');
const Scanner = require('../../controller/treatments/scannerController');
const db  = require('../../config/db');

module.exports.addMedicalHistory = async (req, res) => {
    // medicine + dosage
    let patient_id = null;
    let redirect = null;
    let doctor_id = null;
    if(req.user.doctor_speciality) {
        patient_id = req.body.from_doctor;
        redirect = `/users/doctor/patient_full_details/${patient_id}`;
        doctor_id = req.user.person_id;
    }
    else {
        patient_id = req.user.person_id;
        redirect = '/users/patient/dashboard';
    }
    const { diagnosis, notes, date,treatment } = req.body;
    let treatment_id= null;
    if (treatment == 'prescription') {
        const { medicine, dosage } = req.body;
        treatment_id  = await Prescription.createPrescriptionByPatient(medicine, dosage, date, doctor_id);
    } else if (treatment == 'scanner') {
        const { originalname, path } = req.files[0]; 
        treatment_id = await Scanner.createScannerByPatient(originalname, path, date, doctor_id);
    }

    await createMedicalHistory(treatment_id, diagnosis, notes, patient_id);
    res.redirect(redirect);
}



async function createMedicalHistory(treatment_id, diagnosis, notes, patient_id) {
    await db.query('INSERT INTO medical_history(treatment_id, patient_id, medical_history_diagnosis, medical_history_notes) values($1, $2, $3, $4)', [treatment_id, patient_id, diagnosis, notes]);
}
