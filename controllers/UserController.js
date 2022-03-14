var User = require('../models/User')
var Token = require('../models/Token')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

class UserController {

    async index(req, res) {
        var users = await User.findAll()
        res.json(users)
    }
    
    async get(req, res) {
        var id = req.params.id
        var user = await User.findById(id)
        console.log(user)
        if (user == undefined) {
            res.status(404)
            res.json({error:"User not found."})
        }else {
            res.json(user)
        }
    }

    async create(req, res) {
        var {name, email, password, role} = req.body

        if (name == undefined) {
            res.json({error: "Name is required!"})
            return
        }
        if (email == undefined) {
            res.json({error: "E-mail is required!"})
            return
        }
        if (password == undefined) {
            res.json({error: "Password is required!"})
            return
        }
        if (role == undefined) {
            res.json({error: "Role is required!"})
            return
        }

        var emailExists = await User.findEmail(email)

        if (emailExists) {
            res.json({error: "This email is already registered."})
            return
        }

        await User.insert(name,email,password,role)
        res.json({success: "Registration done!"})
    }

    async edit(req, res) {
        var {id,name,email,role} = req.body
        var result = await User.update(id,name,email,role)
        if (result != undefined && result.status) {
            res.json({success: "Operation performed successfully!"})
        }else {
            res.json({error: result.error})
        }
    }

    async destroy(req, res) {
        var id = req.params.id
        var result = await User.delete(id)
        if (result.status) {
            res.json({success: "Operation performed successfully!"})
        }else {
            res.json({error: result.error})
        }
    }

    async recoverPassword(req, res) {
        var email = req.body.email
        var result = await Token.create(email)
        if (result.status) {
            console.log(result.token)
            res.json({token: result.token})
        }else {
            res.status(406)
            res.json({error: result.error})
        }
    }

    async changePassword(req, res) {
        var tk = req.body.token
        var password = req.body.password
        var isTokenValid = await Token.validate(tk)
        if (isTokenValid.status) {
            await User.changePassword(isTokenValid.token.user_id,password,isTokenValid.token.token)
            res.json({success: "Password updated!"})
        }else {
            res.status(406)
            res.json({error: "Invalid token!"})
        }
    }

    async login(req, res) {
        var {email, password} = req.body
        var user = await User.auth(email)
        if (user != undefined) {
            var result = await bcrypt.compare(password,user.password)
            if (result) {
                var token = jwt.sign({id: user.id, name: user.name, email: user.email, roel: user.role}, process.env.SECRET)
                res.json({token: token})
            }else {
                res.json({error: "Incorrect password!"})
            }            
        }else {
            res.json({status: false})
        }
    }

}

module.exports = new UserController()