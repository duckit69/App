const express = require('express');
const route = express.Router();
const Sensor = require('../../model/sensor/sensor');


route.put('/:id', Sensor.updateSensor);
route.delete('/:id', Sensor.deleteSensor);
route.post('/:id', Sensor.addSensor);
module.exports = route;