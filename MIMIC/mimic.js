const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const patientId = '442'; // Replace with actual patient ID
const sensorType = 'blood-pressure'; // Replace with actual sensor type
const sensorModel = 'MMq';
const sensorName = 'BloodPressureSensor'

const apiUrl = 'http://localhost:3000/sensor';
const value = `00mmHg/00mmHg`;
let bloodPreassureSensorId = null;
let sugarSensorId = null;
const subscriptionData = {
  patientId: patientId,
  sensorType: sensorType,
  sensorModel: sensorModel,
  sensorName: sensorName,
  value
};

async function firstCall() {
  const test = await fetch(`${apiUrl}/${patientId}`, {
    method: 'post',
    body: JSON.stringify(subscriptionData),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  bloodPreassureSensorId = await test.json();
}
async function secondCall() {
  subscriptionData.sensorType = "SugarSensor";
  subscriptionData.sensorName = "SugarSensor";
  const test = await fetch(`${apiUrl}/${patientId}`, {
    method: 'post',
    body: JSON.stringify(subscriptionData),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  sugarSensorId = await test.json();
}


// const firstCall = (async () => {
//   const test = await fetch(`${apiUrl}/${patientId}`, {
//     method: 'post',
//     body: JSON.stringify(subscriptionData),
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });

//   const id = await test.json();
//   bloodPreassureSensorId = id;
//   console.log("first call: " + id);
// })

// const secondCall = (async () => {
//   subscriptionData.sensorType = "SugarSensor";
//   subscriptionData.sensorName = "SugarSensor";
//   const test = await fetch(`${apiUrl}/${patientId}`, {
//     method: 'post',
//     body: JSON.stringify(subscriptionData),
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
//   const id = await test.json();
//   sugarSensorId = id;
//   console.log("second call: " + id);
// });


client.on('connect', async () => {
  const subscriptionData = {
    patientId: patientId,
    sensorType: sensorType,
    value
  };
  console.log('Client connected to MQTT broker');

  client.publish('subscription', JSON.stringify(subscriptionData));
  console.log('Sent subscription data:', subscriptionData);
  client.subscribe(sensorType, function (err) {
    if (err) {
      console.error(`Error subscribing to ${sensorType} topic:`, err);
    } else {
      console.log(`Client subscribed to ${sensorType} topic`);
    }
  });
});


const mimic = async () => {
  console.log("Start");
  await firstCall();
  await secondCall();
  setInterval(() => {
    console.log("On setInterval func: " + bloodPreassureSensorId + ", " + sugarSensorId);
    // sys + dias(ras) -> 12 _ 8
    const systolic = Math.floor(Math.random() * (150 - 90 + 1) + 90);
    const diastolic = Math.floor(Math.random() * (100 - 60 + 1) + 60);
    const message = JSON.stringify({ systolic, diastolic });
    const value = `${systolic}mmHg/${diastolic}mmHg`;
    const bloodPressureData = {
      patientId: patientId,
      sensorId: bloodPreassureSensorId,
      sensorType: sensorType,
      value,
      time: new Date()
    };
    client.publish(sensorType, JSON.stringify(bloodPressureData));
    
    console.log(`Sent blood pressure data: ${JSON.stringify(bloodPressureData)}`);
  }, 5000);
  
  setInterval(() => {
    // sys + dias(ras) -> 12 _ 8
    const sugar = Math.floor(Math.random() * (7 - 0.2 + 1) + 0.2 * 10) / 10;
    const value = `${sugar}mg/dl`;
    const bloodPressureData = {
      patientId: patientId,
      sensorId: sugarSensorId,
      sensorType: "SugarSensor",
      value,
      time: new Date()
    };
    client.publish('sugar', JSON.stringify(bloodPressureData));
    
    console.log(`Sent blood pressure data: ${JSON.stringify(bloodPressureData)}`);
  }, 7000);

}
//Send blood pressure data every 5 seconds
mimic();