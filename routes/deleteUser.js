const express = require('express')
const router = express.Router()

const { deleteUser, getAllUsers } = require('../controllers/deleteUser')

router.delete('/delete', deleteUser)
router.get('/', getAllUsers)

module.exports = router
