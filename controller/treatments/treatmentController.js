const db = require('../../config/db');

module.exports.findTreatmentById = async (req, res) => {
    const id = req.params.id;
    // const testPres = await db.query('SELECT * FROM prescription, treatment WHERE prescription.treatment_id = $1', [id]);
    // console.log(testPres.rows);
    // return object as json
    const html = `<div class="card"><div class="card-body"><h5 class="card-title">${testPres.rows[0].prescription_medicine}</h5><h6 class="card-text">${testPres.rows[0].prescription_dosage}</h6><p class="lead">${testPres.rows[0].treatment_date.toLocaleString()}</p>`;
    res.send(html);
}

module.exports.createTreatment = async (date) => {
    const { rows } = await db.query('INSERT INTO treatment(treatment_date) values($1) returning treatment_id', [date]);
    return rows[0].treatment_id;
}



// select * from treatment 
// join prescription on treatment.treatment_id = prescription.treatment_id;