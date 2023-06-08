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
const years = Array.from({ length: 2002 - 1960 }, (_, i) => (1960 + i).toString());
const treatment_years = Array.from({ length: 2022 - 2019}, (_, i) => (2019 + i).toString());
const months = Array.from({ length: 7}, (_, i) => (1 + i).toString());
const days = Array.from({ length: 22 }, (_, i) => (1 + i).toString());
const dctr_names = ["Laila Hassan", "Aisha Ali",
    "Fatima Khalid","Yara Ahmad",
    "Zainab Omar","Hussein Mahmoud",
    "Ahmad Abdullah",  "Noura Mohamed",
    "Mariam Khalil","Jawad Said",
    "Nada Hani","Nidal Fawzi",
    "Majid Samir","Abdulrahman Al-Farsi",
    "Hiba Saeed","Yousef Al-Salem",
    "Rana Hassan","Zakiyah Ibrahim",
    "Haniyah Ziad","Hassan Ali",
    "Amani Khalifa","Zahraa Fawzi",
    "Saeed Al-Rashid","Yasin Al-Mansoori","Najwa Ahmed","Layth Al-Hajri", "Maya Al-Khouri",
    "Rasha Al-Naqbi","Aminah Al-Ameri",
    "Samirah Al-Mazrouei",
    "Tariq Al-Hamadi",
    "Abeer Al-Dosari",
    "Khalifa Al-Mahri",
    "Zakariyah Al-Saadi"]
    const patient_names = ["Bouzidi Amel", "Lachemi Bouzid",
    "Benzahia yacine","Debieb Islem",
    "Bessissa Dokman","benboularebah mahdi",
    "Gherab mohammed",  "Bendjedou Oussama",
    "Rezzak Imad","Hammi Nail",
    "Berini Hamza","Khir Bek Aziz",
    "Khadroun Nizar","Gracha Farouk",
    "Kired Ziane","Bennaoum amine",
    "Elbahi Mahmoud","Belhout Abdou",
    "Drosh Amine","Ali Ben Hamza",
    "BenMammar Ibrahim","Saeid Amine",
    "Shouikat Fathi","Berini Hamza"]
function getRandomBirthDate() {
    const randomYear = years[Math.floor(Math.random() * years.length)];
    const randomMonth = months[Math.floor(Math.random() * months.length)];
    const randomDay = days[Math.floor(Math.random() * days.length)];

    return `${randomYear}-${randomMonth.padStart(2, '0')}-${randomDay.padStart(2, '0')}`;
}

function getRandomTreatmentDate() {
    const randomYear = treatment_years[Math.floor(Math.random() * treatment_years.length)];
    const randomMonth = months[Math.floor(Math.random() * months.length)];
    let randomDay = days[Math.floor(Math.random() * days.length)];

    return `${randomYear}-${randomMonth.padStart(2, '0')}-${randomDay.padStart(2, '0')}`;
}

client.connect();
const salt = 10;
// Generate the dummy data and insert it into the database
const insertDummyData = async () => {
    // Generate 100 patients
    for (let i = 0; i < 23; i++) {
        const person_name = patient_names[i];
        const person_gender = faker.random.arrayElement(['Male', 'Female']).toUpperCase();
        const person_birth_date = getRandomBirthDate();
        const person_username = `patient${++i}`;
        const hashedPD = `patient${++i}`;
        const person_password = await bcrypt.hash(hashedPD, salt);
        const person_phone = faker.phone.phoneNumber();
        const patient_atcd = faker.random.arrayElement(['true', 'false']);
        const patient_cigaretteconsomation = faker.datatype.number({max: 50});
        const patient_sedentary = faker.datatype.number({max: 60});
        const patient_alchoolconsomation = faker.datatype.number({max: 10});
        const patient_height = faker.datatype.number({min: 130, max: 210});
        const patient_weight = faker.datatype.number({min: 25, max: 150});
        await client.query('INSERT INTO patient (person_name, person_gender, person_birth_date, person_username, person_password, patient_atcd, patient_cigaretteconsomation, patient_sedentary, patient_alchoolconsomation, patient_height, patient_weight, person_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                                                [person_name, person_gender, person_birth_date, person_username, person_password, patient_atcd, patient_cigaretteconsomation, patient_sedentary, patient_alchoolconsomation, patient_height, patient_weight ,person_phone]);
    }

    // Generate 35 doctors
    for (let i = 0; i < 30; i++) {
        const person_name = dctr_names[i];
        const person_gender = faker.random.arrayElement(['Male', 'Female']).toUpperCase();
        const person_birth_date = getRandomBirthDate();
        const person_username = `doctor${++i}`;
        const hashedPD = `doctor${++i}`;
        const person_password = await bcrypt.hash(hashedPD, salt);
        const doctor_speciality = faker.random.arrayElement(['Cardiology', 'Dermatology', 'Gastroenterology', 'Neurology', 'Oncology']);
        const person_phone = faker.phone.phoneNumber();
        await client.query('INSERT INTO doctor (person_name, person_gender, person_birth_date, person_username, person_password, doctor_speciality, person_phone) VALUES ($1, $2, $3, $4, $5, $6, $7)', [person_name, person_gender, person_birth_date, person_username, person_password, doctor_speciality, person_phone]);
    }
    
    // const doctor_result = await client.query('SELECT * FROM doctor');
    // const treatment_medicine = faker.random.arrayElement(['Doliprance', 'Aspirine', 'Arvea', 'Levothyrox', 'Xéfuryl']);
    // const treatment_dosage = faker.random.arrayElement(['33mg', '50mg', '125mg', '250mg', '100mg']);
    // // Generate 40 Prescription
    // for (let i = 0; i < 40; i++) {
    //     // create treatment
    //     const doctor_id = doctor_result.rows[Math.floor(Math.random() * doctor_result.rowCount)].person_id;
    //     const treatment_date = getRandomTreatmentDate();
    //     const {rows} = await client.query('INSERT INTO treatment (doctor_id, treatment_date) VALUES ($1, $2) returning treatment_id', [doctor_id, treatment_date]);
    //     const treatment_id = rows[0].treatment_id;
    //     const medicine = treatment_medicine[Math.floor(Math.random() * treatment_medicine.length)];
    //     const dosage = treatment_dosage[Math.floor(Math.random() * treatment_dosage.length)];
    //     await client.query('INSERT INTO prescription(treatment_id, treatment_date, prescription_medicine, prescription_dosage) values($1, $2, $3, $4)', [treatment_id, treatment_date, medicine, dosage]);
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
    // for (let i = 0; i < 50; i++) {
    //     const sensor_name = faker.random.arrayElement(['SugarSensor', 'Bloodensor', 'HeartRate', 'BodyGuardian', 'TempTracker', 'MoveMinder', 'SkinSense']);
    //     const sensor_model_number = faker.random.arrayElement(['CGM-123A', 'BP-M456', 'ECG-789B', 'SpO2-012C', 'Temperature-345D', 'Accelerometer-678E', 'GSR-901F']);
    //     await client.query('INSERT INTO sensor (sensor_name, sensor_model_number) VALUES($1, $2)', [sensor_name, sensor_model_number]);
    // }
    // // Generate recorded Data
    // const patient = await client.query('SELECT * FROM patient');
    // const observation = await client.query('SELECT * FROM OBSERVATION');
    // for (let i = 0; i < 168; i++) {
    //     const { sensor_id, observation_value, observation_unit } = observation.rows[Math.floor(Math.random() * observation.rowCount)];
    //     const patient_id = patient.rows[Math.floor(Math.random() * patient.rowCount)].person_id;
    //     const recorded_data_date = '2023-03-28';
    //     await client.query('WITH removed AS (DELETE FROM recorded_data WHERE sensor_id = $1 RETURNING *)INSERT INTO recorded_data (patient_id, sensor_id, recorded_data_unit, recorded_data_date, recorded_data_value) VALUES ($2, $1, $3, $4, $5)', [sensor_id, patient_id, observation_unit, recorded_data_date, observation_value]);
    // }
    // Generate Appointments
    // const dates = [
    //     "2023-04-01 09:15:30",
    //     "2023-04-02 18:45:12",
    //     "2023-04-03 08:30:00",
    //     "2023-04-04 14:20:45",
    //     "2023-04-05 11:55:30",
    //     "2023-04-06 16:10:15",
    //     "2023-04-07 12:40:00",
    //     "2023-04-08 17:25:30",
    //     "2023-04-09 07:15:00",
    //     "2023-04-10 13:50:45",
    //     "2023-04-11 10:30:15",
    //     "2023-04-12 15:05:30",
    //     "2023-04-13 11:25:00",
    //     "2023-04-14 19:15:45",
    //     "2023-04-15 08:40:30",
    //     "2023-04-16 16:55:15",
    //     "2023-04-17 12:30:00",
    //     "2023-04-18 10:05:30",
    //     "2023-04-19 14:50:15",
    //     "2023-04-20 09:20:00",
    //     "2023-04-21 18:35:45",
    //     "2023-04-22 07:10:30",
    //     "2023-04-23 11:55:15",
    //     "2023-04-24 15:30:45",
    //     "2023-04-25 13:05:30",
    //     "2023-04-26 17:40:00"
    // ];
    // const patients = await client.query('SELECT * FROM patient');
    // const doctors = await client.query('SELECT * FROM doctor');
    // for (let i = 0; i < 26; i++) {
    //     const date = dates[Math.floor(Math.random() * dates.length)];
    //     const patient = patients.rows[Math.floor(Math.random() * patients.rowCount)].person_id;
    //     const doctor = doctors.rows[Math.floor(Math.random() * doctors.rowCount)].person_id;
    //     const type = faker.random.arrayElement(['Online', 'Offline']).toUpperCase();
    //     const reason = faker.lorem.word();
    //     // const params = [doctor, patient, date, type, reason];
    //     // await client.query('insert into appointment (doctor_id, patient_id, appointment_date, appointment_type, appointment_reason) values($1, $2, $3, $4, $5)', params);
    //     await client.query('insert into appointment(doctor_id, patient_id, appointment_date, appointment_type, appointment_reason) values($1, $2, $3, $4, $5)', [doctor, patient, date, type, reason]);
    // }
};

insertDummyData().then(() => {
    console.log('Done seeding the database!');
    client.end();
}).catch((error) => {
    console.error(error);
    client.end();
})



async function evaluatePatient(patient_id) {
    const riskFactors = await countCardioVascularRiskFactors(patient_id);
    const { counter, factors } = riskFactors;
    let riskClass = null;
    if (counter < 1) {
        riskClass = 'NO RISK';
    } else if (counter == 1) {
        riskClass = 'LOW RISK'
    } else if (counter == 2) {
        riskClass = 'MODERATE RISK'
    } else {
        riskClass = 'HIGH RISK';
    }
    const answer = {
        counter,
        riskClass,
        factors
    }
    return answer;
}


async function countCardioVascularRiskFactors(patient_id) {
    let counter = 0;
    const factors = {};
    const gender = await getGender(patient_id);
    const age = await getAge(patient_id);
    const ATCD = await getATCD(patient_id);
    const cigarettePerDay = await getSmokeState(patient_id);
    const cupPerDay = await getDrinkState(patient_id);
    const minutesPerDay = await getSidentarite(patient_id);
    const sensors = await Patient.findAllSensorsMostRecentDataForOnePatient(patient_id);
    sensors.forEach(element => {
        if(element.sensor_type == 'SugarSensor') {
            const value = parseFloat(element.recorded_data_value.slice(0, 3));
            if (value > 1.2) {
                counter++;
                factors['SugarLevel'] = value;
            }
        } 
    })
    if (gender == 'MALE') {
        factors['gender'] = gender;
        counter++;
        if (age > 50) {
            factors['age'] = age;
            counter++;
        }
    }
    if (gender == 'FEMALE')
        if (age > 60) counter++;
    if (ATCD.atcd) {
        counter++;
        factors['atcd'] = ATCD.atcd;
    }
    
    if (cigarettePerDay.cigaretteperday > 10) {
        counter++;
        factors['smoke'] = cigarettePerDay.cigaretteperday;
    }
    if (cupPerDay > 3) {
        counter++;
        factors['drink'] = cupPerDay;
    }
    if (parseInt(minutesPerDay) < 30) {
        counter++;
        factors['workout'] = minutesPerDay;
    }
    const result = {counter, factors};
    return result;
}

































