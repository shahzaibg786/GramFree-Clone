const Users = require('../models/userModel')

const authAdmin = async(req, res, next) =>{
    try {
        const user = await Users.findOne({_id: req.user.id})

        if(user.role !== 1) 
        res.status(500).json({msg: "Admin Access Denied."})

        next()
    } catch (error) {
        res.status(501).json({msg: error.message})
    }
}

module.exports = authAdmin