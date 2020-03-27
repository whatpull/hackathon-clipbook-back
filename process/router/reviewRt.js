const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controller/reviewCtrl');

router.post('/private/review', reviewCtrl.regist);
router.get('/public/review/list', reviewCtrl.list);
router.put('/private/review', reviewCtrl.update);

module.exports = router;


