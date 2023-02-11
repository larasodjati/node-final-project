const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')

const deleteUser = async (req, res) =>{
    
    const{id} = req.user
    try{
        await User.findOneAndDelete({ user: id })
        res.status(StatusCodes.OK).json({ msg: 'The user was deleted'})
    } catch (e){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err.msg})
    }
    
}

module.exports = deleteUser