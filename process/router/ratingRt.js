const express = require('express');
const router = express.Router();
const ratingCtrl = require('../controller/ratingCtrl');

router.post('/private/rating', ratingCtrl.regist);
router.put('/private/rating', ratingCtrl.update);

module.exports = router;
