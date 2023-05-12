const db = require('../../config/db');
const path = require('path');
const Prescription = require('../../controller/treatments/prescription');
const Scanner = require('../../controller/treatments/scannerController');

module.exports.findTreatmentById = async (req, res) => {
    const id = req.params.id;
    const testPres = await db.query('SELECT * FROM prescription, treatment WHERE prescription.treatment_id = treatment.treatment_id and prescription.treatment_id = $1', [id]);
    const testScanner = await db.query('SELECT * FROM scanner, treatment WHERE scanner.treatment_id = treatment.treatment_id and scanner.treatment_id = $1', [id]);
    let html = null;
    console.dir(testPres.rows);
    if (testPres.rows.length) {
        const { rows } = await db.query('select * from medicine where prescription_id = $1', [testPres.rows[0].prescription_id]);
        const medicines = rows;
        const date = testPres.rows[0].treatment_date.toLocaleString();
        console.dir({medicines, date})
        let div = "";
        for (const m of medicines) {
            div += `<p class="lead text-center">${m.medicine_name} - ${m.medicine_dosage}</p>`
        }
        div += `<p class="lead fs-6">${date}</p>`
        return res.send({div});
        html = `<div class="card"><div class="card-body"><h5 class="card-title">${testPres.rows[0].prescription_medicine}</h5><h6 class="card-text">${testPres.rows[0].prescription_dosage}</h6><p class="lead">${testPres.rows[0].treatment_date.toLocaleString()}</p>`;
    } else if(testScanner.rows.length) {
        const path1 = `../../${testScanner.rows[0].image_url}`;
        html = `<div class="card"><img class="card-img-top" src="${path1}"><div class="card-body"><h5 class="card-title">${testScanner.rows[0].image_name}</h5><p class="lead"></p>`;
    }
    res.send(html);
}

module.exports.getTreatmentsForOnePatient = async (req, res) => {
    let person_id = null;
    if (req.user.doctor_speciality) {
        console.log(req.query)
        console.log(req.params)
        person_id = req.query.patient_id;
    }else {
        person_id = req.user.person_id;
    }
    const type = req.params.treatment_type;
    let result = null;
    let html = null;
    if (type == 'Prescription') {
        result = await Prescription.getPrescriptionsForOnePatient(person_id);
    }else if (type == 'Scanner') {
        result = await Scanner.getScannersForOnePatient(person_id);
        console.log(result);
    }
    res.send(result);
}