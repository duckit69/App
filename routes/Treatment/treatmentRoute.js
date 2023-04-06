const express = require('express');
const route = express.Router();
const Treatment = require('../../model/treatment/treatment');

route.get('/search/:id',Treatment.findTreatmentById);

module.exports = route;