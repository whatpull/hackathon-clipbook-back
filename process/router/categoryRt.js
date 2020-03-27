const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controller/categoryCtrl');

router.get('/public/category/list', categoryCtrl.list);

module.exports = router;