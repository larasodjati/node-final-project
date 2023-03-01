const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')

const getAllUsers = async (req, res) => {
  const users = await User.find({})
  res.status(StatusCodes.OK).json({ users })
}

const deleteUser = async (req, res) => {
  const id = req.user.userId
  try {
    await User.findByIdAndDelete(id)
    res.status(StatusCodes.OK).json({ msg: 'The user was deleted' })
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err: err.message })
  }
}

module.exports = { getAllUsers, deleteUser }
