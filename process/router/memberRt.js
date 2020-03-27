const express = require('express');
const router = express.Router();
const multer  = require('multer');
const upload = multer();
const memberCtrl = require('../controller/memberCtrl');

router.post('/public/signin', memberCtrl.signin);
router.post('/public/signup', memberCtrl.signup);
router.get('/public/member/:seq', memberCtrl.one);
router.put('/private/member', upload.single('avatar'), memberCtrl.update);
router.post('/public/signin/social', memberCtrl.signinSocial);
router.post('/public/signup/social', memberCtrl.signupSocial);

module.exports = router;