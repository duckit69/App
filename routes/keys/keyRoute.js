const express = require('express');
const route = express.Router();
const Key = require('../../controller/Keys/key');

route.get('/', Key.getPublicKey);

module.exports = route;