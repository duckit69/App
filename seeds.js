const faker = require('faker');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
// Connect to the database
const client = new Client({
    user: 'radouane',
    host: 'localhost',
    database: 'E_health',
    password: 'duckit69',
    port: 5432,
});

client.connect();
const salt = 10;
// Generate the dummy data and insert it into the database
const insertDummyData = async () => {
    // Generate 100 patients
    // for (let i = 0; i < 100; i++) {
    //     const person_name = faker.name.findName();
    //     const person_gender = faker.random.arrayElement(['Male', 'Female']).toUpperCase();
    //     // const date = faker.date.between(('1990-01-01', '2020-12-12'));
    //     const person_birth_date = '2020-01-01';
    //     const person_username = `patient${++i}`;
    //     const hashedPD = `patient${++i}`;
    //     const person_password = await bcrypt.hash(hashedPD, salt);
    //     const patient_phone = faker.phone.phoneNumber();
    //     await client.query('INSERT INTO patient (person_name, person_gender, person_birth_date, person_username, person_password, patient_phone) VALUES ($1, $2, $3, $4, $5, $6)', [person_name, person_gender, person_birth_date, person_username, person_password, patient_phone]);
    // }

    // // // Generate 35 doctors
    // for (let i = 0; i < 35; i++) {
    //     const person_name = faker.name.findName();
    //     const person_gender = faker.random.arrayElement(['Male', 'Female']).toUpperCase();
    //     const person_birth_date = '2020-01-01';
    //     const person_username = `doctor${++i}`;
    //     const hashedPD = `doctor${++i}`;
    //     const person_password = await bcrypt.hash(hashedPD, salt);
    //     const doctor_speciality = faker.random.arrayElement(['Cardiology', 'Dermatology', 'Gastroenterology', 'Neurology', 'Oncology']);
    //     await client.query('INSERT INTO doctor (person_name, person_gender, person_birth_date, person_username, person_password, doctor_speciality) VALUES ($1, $2, $3, $4, $5, $6)', [person_name, person_gender, person_birth_date, person_username, person_password, doctor_speciality]);
    // }
    // const doctor_result = await client.query('SELECT * FROM doctor');
    // // // Generate 100 treatments
    // for (let i = 0; i < 100; i++) {
    //     const doctor_id = doctor_result.rows[Math.floor(Math.random() * doctor_result.rowCount)].person_id;
    //     const treatment_date = '2021-03-09';
    //     const treatment_medicine = faker.random.arrayElement(['Doliprance', 'Aspirine', 'Arvea', 'Levothyrox', 'Xéfuryl']);
    //     const treatment_dosage = faker.random.arrayElement(['33mg', '50mg', '125mg', '250mg', '100mg']);
    //     await client.query('INSERT INTO treatment (doctor_id, treatment_date, treatment_medicine, treatment_dosage) VALUES ($1, $2, $3, $4)', [doctor_id, treatment_date, treatment_medicine, treatment_dosage]);
    // }
    // const patient_result = await client.query('SELECT * FROM patient');
    // const treatment_result = await client.query('SELECT * FROM treatment');
    // // Generate 500 medical histories
    // for (let i = 0; i < 500; i++) {
    //     const treatment_id = treatment_result.rows[Math.floor(Math.random() * treatment_result.rowCount)].treatment_id;
    //     const patient_id = patient_result.rows[Math.floor(Math.random() * patient_result.rowCount)].person_id;
    //     const medical_history_diagnosis = faker.lorem.word();
    //     const medical_history_notes = faker.lorem.word();
    //     await client.query('INSERT INTO medical_history (treatment_id, patient_id, medical_history_diagnosis, medical_history_notes) VALUES ($1, $2, $3, $4)', [treatment_id, patient_id, medical_history_diagnosis, medical_history_notes]);
    // }
    // Generate 50 sensors
    for (let i = 0; i < 50; i++) {
        const sensor_name = faker.random.arrayElement(['SugarSensor', 'Bloodensor', 'HeartRate', 'BodyGuardian', 'TempTracker', 'MoveMinder', 'SkinSense']);
        const sensor_model_number = faker.random.arrayElement(['CGM-123A', 'BP-M456', 'ECG-789B', 'SpO2-012C', 'Temperature-345D', 'Accelerometer-678E', 'GSR-901F']);
        await client.query('INSERT INTO sensor (sensor_name, sensor_model_number) VALUES($1, $2)', [sensor_name, sensor_model_number]);
    }
    // Generate 250 observations 
    const { rows } = await client.query('SELECT * FROM sensor');
    for (let i = 0; i < 250; i++) {
        const observation_type = faker.random.arrayElement(["Blood glucose level", "Body temperature", "Oxygen saturation", "Blood pressure", "Heart rate", "Respiratory rate", "ECG waveform"]
        );
        const observation_value = faker.random.arrayElement(["98.7", "102.1", "96.4", "1.5", "75", "16", "0.12", "97.5", "101.2", "93.8", "18.5", "68", "18", "0.08", "100.3", "98.9", "95.2", "11.8", "72", "14", "0.1", "99.1", "100.6", "97.8", "1.66"]
        );
        const observation_unit = faker.random.arrayElement(["bpm", "mg/dL", "cm", "mmHg", "kg", "ml", "degrees Celsius"]
        );
        const observation_time = '2023-03-27';
        const sensor = faker.random.arrayElement(rows);
        const sensor_id = sensor.sensor_id;
        await client.query('INSERT INTO observation (observation_type, observation_unit, sensor_id, observation_time, observation_value) VALUES($1, $2, $3, $4, $5)', [observation_type, observation_unit, sensor_id, observation_time, observation_value]);
    }
    // Generate recorded Data
    const patient = await client.query('SELECT * FROM patient');
    const observation = await client.query('SELECT * FROM OBSERVATION');
    for (let i = 0; i < 168; i++) {
        const { sensor_id, observation_value, observation_unit } = observation.rows[Math.floor(Math.random() * observation.rowCount)];
        const patient_id = patient.rows[Math.floor(Math.random() * patient.rowCount)].person_id;
        const recorded_data_date = '2023-03-28';
        await client.query('WITH removed AS (DELETE FROM recorded_data WHERE sensor_id = $1 RETURNING *)INSERT INTO recorded_data (patient_id, sensor_id, recorded_data_unit, recorded_data_date, recorded_data_value) VALUES ($2, $1, $3, $4, $5)', [sensor_id, patient_id, observation_unit, recorded_data_date, observation_value]);
    }
  
};

insertDummyData().then(() => {
    console.log('Done seeding the database!');
    client.end();
}).catch((error) => {
    console.error(error);
    client.end();
})
