const express = require('express')
const router = express.Router()
const Controller = require('../controllers/controller')
const {authentication} = require('../middlewares/authentication')

router.post('/login', Controller.login)
router.get('/patient', authentication, Controller.allPatient)
router.get('/patient/:id', authentication, Controller.patient)
router.post('/patient', authentication, Controller.addPatient)
module.exports = router