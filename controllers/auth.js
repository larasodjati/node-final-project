const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const { capitalizeName } = require('../utils/capitalize')

const register = async (req, res) => {
  req.body.name = capitalizeName(req.body.name)
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  // console.log('at line 10 token is', token)
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name }, token })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide a valid email and password.')
  }
  const user = await User.findOne({ email })

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }

  // compare password
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = {
  register,
  login
}
