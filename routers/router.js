// routes/router.js
const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');
const { authentication } = require('../middlewares/authentication');
const { authorization } = require('../middlewares/authorization');

// PUBLIC
router.post('/login', Controller.login);
router.post('/register', Controller.register);

// PROTECTED
router.use(authentication);

//
// ----------- KARYAWAN -----------
//

// Input nilai (tindakan pasien, dll)
router.post('/rewards', authorization(['karyawan']), Controller.inputReward);

// Lihat capaian reward sendiri
router.get('/my-rewards', authorization(['karyawan']), Controller.myRewards);

//
// ----------- ADMIN -----------
//

// Create Unit
router.post('/units', authorization(['admin']), Controller.createUnit);

// Create Action (tindakan) per Unit
router.post('/actions', authorization(['admin']), Controller.createAction);

// Create Range Pengali untuk Action
router.post('/ranges', authorization(['admin']), Controller.createRange);

// Lihat semua capaian reward seluruh karyawan
router.get('/all-rewards', authorization(['admin']), Controller.allRewards);

module.exports = router;
