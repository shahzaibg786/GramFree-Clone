const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Users = require('../models/userModel')
const sendEmail = require('./sendMail')



const {CLIENT_URL} = process.env

//testing purpose
// const userCtrl = {
//     register: async (req,res) => {
//         try {
//             const {name, email, password} = req.body
//             console.log({name, email, password})
//             res.json({msg: "Registered babe"})
//         } catch (error) {
//             return res.status(404).json({msg: error.message})
//         }
//     }

// }

const userCtrl = {
    //register User function
    register: async (req,res) => {
        try {
            const {name, email, password} = req.body
            
            if(!name || !email ||!password)
            return res.status(400).json({msg: "Please Fill the fields"})

            if(!validateEmail(email))
            return res.status(400).json({msg: "Invalid Email"})
            
            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: "this email already exist"})
            if(password.length < 6)
            return res.status(500).json({msg: "Password must be atleast 6 character long"})
            const passwordHash = await bcrypt.hash(password, 12)
            const newUser = {
                name, email, password: passwordHash
            }

            const activation_token = createActivationToken(newUser)

            const url = `${CLIENT_URL}/user/activate/${activation_token}`
            sendEmail(email, url, "Please Verify Your Email")

            res.json({msg: "Register Success! Please activate your account to start"})
        } catch (error) {
            return res.status(404).json({msg: error.message})
        }
    },
    //Activate Email function
    activateEmail: async (req, res) =>{
        try {
            const {activation_token} = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)

            console.log(user)
            const {name, email, password} = user
            const check = await Users.findOne({email})
            if(check) return res.status(400).json({msg: "This email already exist"})

            const newUser = new Users({
                name, email, password
            })

            await newUser.save()

            res.json({msg: "Account has been Activated"})

        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    login: async (req,res) =>{
        try {
            const {email, password} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(501).json({msg: "This email does not exist"})
            const isMatch = await bcrypt.compare(password,user.password)
            if(!isMatch) return res.status(502).json({msg: "Password is incorrect"})

            
            const refresh_token = createRefreshToken({id: user._id})
            res.cookie('refreshtoken',refresh_token,{
                httpOnly: true,
                path: './user/refresh_token',
                maxAge: 7*24*60*60*1000  //7days
            })
            res.json({msg: "Login Successfull!"})

        } catch (error) {
            return res.status(501).json({msg: error.message})
        }
    },
    getAccessToken: (req,res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if(!rf_token) return res.status(501).json({msg: "Please Login Now!"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
                if(err) return res.status(501).json({msg: "Please Login"})

                const access_token = createAccessToken({id: user._id})
                res.json({access_token})
                console.log(user)
            })

            console.log(rf_token)
        } catch (error) {
            res.status(501).json({msg: error.message})
        }
    },
    forgotPassword: async (req,res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "This Email does not exist"})

            const access_token = createAccessToken({id: user._id})
            const url = `${CLIENT_URL}/user/reset/${access_token}`

            sendEmail(email,url, "Reset Your Password")
            res.json({msg: "Re-send the password, Please check your email"})

        } catch (error) {
            res.status(500).json({msg: error.message})
        }
    },
    resetPassword: async (req,res) =>{
        try {
            const {password} = req.body
            console.log(password)
            const passwordHash = await bcrypt.hash(password,12)
            console.log(req.user)
            await Users.findOneAndUpdate({_id: req.user.id},{
                password: passwordHash
            })
            res.json({msg: "Password successfully changed"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    //time 1:23:23
    getUserInfo: async (req,res) =>{
        try {
            const user = await Users.findById(req.user.id).select('-password')

            res.json(user)
        } catch (error) {
           return res.status(501).json({msg: error.message})
            
        }
    },
    //get all users info with admin
    getallUsers: async(req, res) => {
        try {
            console.log(req.user)
            const users = await Users.find().select('-password')
            res.json(users)
        } catch (error) {
            return res.status(501).json({msg: error.message})
        }
    },
    //Logout
    logout : async (req,res) => {
        try {
            res.clearCookie('refreshtoken', {path: './user/refresh_token'})
            return res.json({msg: "Logged Out"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
            
        }
    },
    //Update user infor
    updateUser : async (req,res) =>{
        try {
            const {name, avatar} = req.body
            await Users.findOneAndUpdate({_id: req.user.id}, {
                name, avatar
            })
            res.json({msg: "Update Success"})
        } catch (error) {
            return res.status(501).json({
                msg: error.message
            })
        }
    },
    updateAllUsersRole : async (req,res) =>{
        try {
            const {role} = req.body
            await Users.findOneAndUpdate({_id: req.params.id}, {
                role
            })
            res.json({msg: "Update Success"})
        } catch (error) {
            return res.status(501).json({
                msg: error.message
            })
        }
    },
    deleteUser: async (req,res) =>{
        try {
            await Users.findByIdAndDelete(req.params.id)
            res.json({msg: "Delete Successfully"})
        } catch (error) {
            return res.status(501).json({msg: error.message})
        }
    }
}

// Email Validation function
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

//Activation Token function
const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '5m'})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = userCtrl;