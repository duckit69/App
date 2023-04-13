const express = require('express');
const route = express.Router();
const medicalHistory = require('../../model/medicalHistory/medicalHistory');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
// route.use('/uploads', express.static('uploads'));



route.post('/', upload.array('photos'),medicalHistory.addMedicalHistory);

module.exports = route;