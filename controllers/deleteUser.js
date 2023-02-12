const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')

const deleteUser = async (req, res) => {
  const { id } = req.user
  try {
    await User.findOneAndDelete({ id })
    res.status(StatusCodes.OK).json({ msg: 'The user was deleted' })
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: err.message })
  }
}

module.exports = deleteUser
