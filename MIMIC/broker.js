const mqtt = require('mqtt');
const fetch = require('node-fetch');

const brokerUrl = 'mqtt://localhost:1883';
const apiUrl = 'http://localhost:3000/sensor';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Broker connected');

  client.subscribe('blood-pressure', (err) => {
    if (err) {
      console.error(`Error subscribing to all topics: ${err}`);
    } else {
      console.log('Subscribed to blood-pressure topic');
    }
  });
  client.subscribe('sugar', (err) => {
    if (err) {
      console.error(`Error subscribing to all topics: ${err}`);
    } else {
      console.log('Subscribed to sugar sensor topic');
    }
  });
});

client.on('message', (topic, message) => {
  const result = message.toString();
  if (topic == 'blood-pressure') {
    fetch(`${apiUrl}/blood_pressure`, {
        method: 'POST',
        body: JSON.stringify({ topic, message: message.toString() }),
        //body: JSON.stringify({bloodPressureData}),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          console.log(`API response: ${res.status} ${res.statusText}`);
        })
        .catch((err) => {
          console.error(`Error sending data to API: ${err}`);
        });
  } else {
    fetch(`${apiUrl}/sugar`, {
        method: 'POST',
        body: JSON.stringify({ topic, message: message.toString() }),
        //body: JSON.stringify({bloodPressureData}),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          console.log(`API response: ${res.status} ${res.statusText}`);
        })
        .catch((err) => {
          console.error(`Error sending data to API: ${err}`);
        });
  }
  // Forward the data to the API
  
});
