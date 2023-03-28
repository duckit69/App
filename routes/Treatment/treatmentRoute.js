const express = require('express');
const route = express.Router();
const Treatment = require('../../controller/treatments/treatmentController');

route.get('/search/:id',Treatment.findTreatmentById);

module.exports = route;