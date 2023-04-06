const express = require('express');
const route = express.Router();
const medicalHistory = require('../../model/medicalHistory/medicalHistory');

route.post('/', medicalHistory.addMedicalHistory);

module.exports = route;