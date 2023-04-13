const db = require('../../config/db');
const path = require('path');


module.exports.findTreatmentById = async (req, res) => {
    const id = req.params.id;
    const testPres = await db.query('SELECT * FROM prescription, treatment WHERE prescription.treatment_id = treatment.treatment_id and prescription.treatment_id = $1', [id]);
    const testScanner = await db.query('SELECT * FROM scanner, treatment WHERE scanner.treatment_id = treatment.treatment_id and scanner.treatment_id = $1', [id]);
    let html = null;
    if (testPres.rows.length) {
        html = `<div class="card"><div class="card-body"><h5 class="card-title">${testPres.rows[0].prescription_medicine}</h5><h6 class="card-text">${testPres.rows[0].prescription_dosage}</h6><p class="lead">${testPres.rows[0].treatment_date.toLocaleString()}</p>`;
    } else if(testScanner.rows.length) {
        const path1 = `../../${testScanner.rows[0].image_url}`;
        html = `<div class="card"><img class="card-img-top" src="${path1}"><div class="card-body"><h5 class="card-title">${testScanner.rows[0].image_name}</h5><p class="lead"></p>`;
    }
    res.send(html);
}