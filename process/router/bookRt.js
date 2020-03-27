const express = require('express');
const router = express.Router();
const multer  = require('multer');
const upload = multer();
const bookCtrl = require('../controller/bookCtrl');

router.post('/private/book', upload.single('thumbnail'), bookCtrl.regist);
router.get('/public/book/list', bookCtrl.list);
router.get('/public/book/:seq', bookCtrl.one);
router.put('/private/book', upload.single('thumbnail'), bookCtrl.update);

module.exports = router;