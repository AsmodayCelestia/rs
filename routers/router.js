// ✅ routes/router.js
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


router.post('/rewards', authorization(['karyawan']), Controller.inputReward);
router.get('/my-rewards', authorization(['karyawan']), Controller.myRewards);


router.get('/user/:id/rewards', authorization(['admin']), Controller.rewardsByUserId);
router.put('/user/:id/reward/:performanceId', authorization(['admin']), Controller.updateUserReward);
router.delete('/user/:id/reward/:performanceId', authorization(['admin']), Controller.deleteUserReward);

router.get('/my-performance', Controller.myPerformance);
router.get('/user/:id/performance', authorization(['admin']), Controller.performanceByUserId);


router.post('/units', authorization(['admin']), Controller.createUnit);
router.get('/units', Controller.getUnits);
router.get('/units/:id', Controller.getUnitById);
router.put('/units/:id', authorization(['admin']), Controller.updateUnit);
router.delete('/units/:id', authorization(['admin']), Controller.deleteUnit);

router.post('/actions', authorization(['admin']), Controller.createAction);
router.get('/actions', Controller.getActions);
router.get('/actions/:id', Controller.getActionById);
router.put('/actions/:id', authorization(['admin']), Controller.updateAction);
router.delete('/actions/:id', authorization(['admin']), Controller.deleteAction);

router.post('/ranges', authorization(['admin']), Controller.createRange);
router.get('/ranges', Controller.getRanges);
router.get('/ranges/:id', Controller.getRangeById);
router.put('/ranges/:id', authorization(['admin']), Controller.updateRange);
router.delete('/ranges/:id', authorization(['admin']), Controller.deleteRange);

router.get('/all-rewards', authorization(['admin']), Controller.allRewards);

module.exports = router;
