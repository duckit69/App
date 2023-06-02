const db = require('../../config/db');
const crypto = require('crypto');

const Key = require('../../controller/Keys/key');
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
    console.log('Add sensor function 1');
    const { sensorModel, sensorName, sensorType, patientId } = req.body;
    const  { sensor_id }  = await createSensor(sensorName, sensorModel, sensorType);
    console.log('Add sensor function 2');
    console.log(sensor_id + " " + patientId);

    await createFirstRecord(patientId, sensor_id);
    console.log('Add sensor function 3');

    const test = JSON.stringify(sensor_id);
    console.log('Add sensor function 4');

    res.send(test);
    //res.redirect('/users/patient/dashboard');
}
module.exports.addRecord = async (req, res) => {
    const encryptedData = req.body.message;
    
    // Decrypt the data using the private key
    const decrypted = crypto.privateDecrypt(Key.privateKey, Buffer.from(encryptedData, 'base64'));
    const decryptedStr = decrypted.toString('utf8');
    const parsedData = JSON.parse(decrypted);
    console.log("HEY: ");
    console.dir(parsedData);

    // Uncomment the following lines and modify them according to your data structure
    const { patientId, sensorId, value, time } = JSON.parse(parsedData);;
    await createRecord(patientId, sensorId, value, time);

    res.send("Updated").status(200);
}


// module.exports.addRecord = async (req, res) => {
//     const test = JSON.parse(req.body.message);
//     const {patientId, sensorId, value, time} = test;
//     await createRecord(patientId, sensorId, value, time);
//     res.send("Updated").status(200);
// }

// module.exports.addSensor = async (req, res) => {
//     const patientID = req.params.id;
//     const { name, model } = req.body;
//     const  {sensor_id}  = await createSensor(name, model, type);
//     await createRecord(patientID, sensor_id);
//     res.send(sensor_id);
//     //res.redirect('/users/patient/dashboard');
// }

async function updateSensorName(sensorId, sensorNewName){
    const result = await db.query('UPDATE sensor SET sensor_name = $1 WHERE sensor_id = $2', [sensorNewName, sensorId]);
    return result;
}

async function deleteSensor(sensorId) {
    return await db.query('delete from sensor where sensor.sensor_id = $1', [sensorId]);
}

async function createSensor(name, model, type) {
    const { rows } = await db.query('INSERT INTO sensor(sensor_name, sensor_model_number, sensor_type) values($1,$2, $3) returning sensor_id', [name, model, type]);
    return rows[0];
}

async function createFirstRecord(patientID, sensor_id) {
    console.log('Create First Record')
    return await db.query('INSERT INTO recorded_data(patient_id, sensor_id) values($1, $2)', [patientID, sensor_id]);
}
async function createRecord(patientId, sensorId, recorded_value, time) {
    return await db.query('INSERT INTO recorded_data(recorded_data_date, recorded_data_value, patient_id, sensor_id) values($1, $2, $3, $4)', [time, recorded_value, patientId, sensorId]);
}