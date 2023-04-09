const db = require('../../config/db');

module.exports.updateSensor = async (req, res) => {
    const sensorNewName  = req.body.name;
    const sensorId = req.params.id;
    const result = await updateSensorName(sensorId, sensorNewName);
    res.redirect('/users/patient/dashboard');
}

module.exports.deleteSensor = async (req, res) => {
    const sensorId = req.params.id;
    const result = await deleteSensor(sensorId);
    res.redirect('/users/patient/dashboard');
}
// This Must be a CLIENT not POOL BECAUSE IT IS A TRANSACTION
module.exports.addSensor = async (req, res) => {
    const patientID = req.params.id;
    const { name, model } = req.body;
    const  {sensor_id}  = await createSensor(name, model);
    await createRecord(patientID, sensor_id);
    res.redirect('/users/patient/dashboard');
}

async function updateSensorName(sensorId, sensorNewName){
    const result = await db.query('UPDATE sensor SET sensor_name = $1 WHERE sensor_id = $2', [sensorNewName, sensorId]);
    return result;
}

async function deleteSensor(sensorId) {
    return await db.query('delete from sensor where sensor.sensor_id = $1', [sensorId]);
}

async function createSensor(name, model) {
    const { rows } = await db.query('INSERT INTO sensor(sensor_name, sensor_model_number) values($1,$2) returning sensor_id', [name, model]);
    return rows[0];
}

async function createRecord(patientID, sensor_id) {
    return await db.query('INSERT INTO recorded_data(patient_id, sensor_id) values($1, $2)', [patientID, sensor_id]);
}