const mqtt = require('mqtt');
const fetch = require('node-fetch');
const crypto = require('crypto');

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
let public_key = null;
client.on('message', async (topic, message) => {
  if(!public_key) {
    const json_public_key = await fetch('http://localhost:3000/public_key');
    public_key = await json_public_key.json();
    console.log(public_key);
  }else {
    const to_be_crypted = message.toString();
    const plaintext = JSON.stringify(to_be_crypted);
    const encrypted = crypto.publicEncrypt(public_key, Buffer.from(plaintext, 'utf8'));
    if (topic == 'blood-pressure') {

      fetch(`${apiUrl}/blood_pressure`, {
          method: 'POST',
          body: JSON.stringify({ topic, message: encrypted.toString('base64') }),
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
          body: JSON.stringify({ topic, message: encrypted.toString('base64')  }),
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
  }
  
});
