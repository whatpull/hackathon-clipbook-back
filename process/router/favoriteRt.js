const express = require('express');
const router = express.Router();
const favoriteCtrl = require('../controller/favoriteCtrl');

router.post('/private/favorite', favoriteCtrl.regist);
router.get('/public/favorite/list', favoriteCtrl.list);
router.delete('/private/favorite', favoriteCtrl.remove);

module.exports = router;