const express = require('express');
const route = express.Router();
const Treatment = require('../../model/treatment/treatment');

route.get('/search/:id',Treatment.findTreatmentById);
route.get('/:treatment_type', Treatment.getTreatmentsForOnePatient)
module.exports = route;