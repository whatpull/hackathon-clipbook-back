const express = require('express');
const router = express.Router();
const readCtrl = require('../controller/readCtrl');

router.post('/private/read', readCtrl.regist);
router.get('/public/read/list', readCtrl.list);
router.delete('/private/read', readCtrl.remove);

module.exports = router;