const Treatment  = require('./treatmentController');
const db = require('../../config/db');

module.exports.createScannerByPatient = async (originalname, path, date) => {
    const treatmentId = await Treatment.createTreatment(date);
    const { rows } = await db.query('INSERT INTO scanner(treatment_id, treatment_date, image_url, image_name) values($1, $2, $3, $4) returning treatment_id', [treatmentId, date, path, originalname]);
    return rows[0].treatment_id;
}