const db = require('../../config/db');

module.exports.findTreatmentById = async (req, res) => {
    const id = req.params.id;
    const result = await db.query('SELECT * FROM treatment WHERE treatment_id = $1', [id]);
    const html = `<div class="card"><div class="card-body"><h5 class="card-title">${result.rows[0].treatment_medicine}</h5><h6 class="card-text">${result.rows[0].treatment_dosage}</h6><p class="lead">${result.rows[0].treatment_date.toLocaleString()}</p>`;
    res.send(html);
}
