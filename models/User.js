var knex = require('../database/connection')
var bcrypt = require('bcrypt')
const Token = require('./Token')

class User {

    async findAll() {

        try {
            var result = await knex.select(['id','name','email','role']).table('users')
            if (result.length > 0) {
                return result
            }else {
                return undefined
            }
        } catch (err) {
            console.log(err)
            return undefined
        }

    }

    async findById(id) {

        try {
            var result = await knex.select(['id','name','email','role']).where({id:id}).table('users')

            if (result.length > 0) {
                return result[0]
            }else {
                return undefined
            }
        } catch (err) {
            console.log(err)
            return undefined
        }

    }

    async findByEmail(email) {

        try {
            var result = await knex.select(['id','name','email','role']).where({email:email}).table('users')

            if (result.length > 0) {
                return result[0]
            }else {
                return undefined
            }
        } catch (err) {
            console.log(err)
            return undefined
        }

    }

    async findEmail(email) {
        try {
            var result = await knex.select('*').from('users').where({email: email})
            if (result.length > 0) {
                return true
            }else {
                return false
            }
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async insert(name,email,password,role) {

        try {
            var hash = await bcrypt.hash(password, 10)
            await knex.insert({name,email,password: hash,role}).table('users')
        }catch(err) {
            console.log(err)
        }        
    }

    async update(id, name, email, role) {

        var user = await this.findById(id)

        if (user != undefined) {

            var editUser = {}

            if (email != undefined && email != user.email) {
                var result = await this.findEmail(email)
                if(!result) {
                    editUser.email = email
                }else {
                    return {status: false, error: "Email already registered."}
                }
            }

            if (name != undefined) {
                editUser.name = name
            }

            if (role != undefined) {
                editUser.role = role
            }

            try {
                await knex.update(editUser).where({id: id}).table('users')
                return {status: true}
            } catch (err) {
                return {status: false, error: err}
            }

        }else {
            return {status: false, error: "User not found."}
        }

    }

    async delete(id) {
        var user = await this.findById(id)
        if (user != undefined) {
            try {
                await knex.delete().where({id: id}).table('users')
                return {status: true}
            } catch (error) {
                return {status: false, error: error}    
            }
        }else {
            return {status: false, error: "User not found."}
        }
    }

    async changePassword(id, password, token) {
        var hash = await bcrypt.hash(password, 10)
        await knex.update({password:hash}).where({id:id}).table('users')
        await Token.setUsed(token)
    }

    async auth(email) {

        try {
            var result = await knex.select(['id','name','email','password','role']).where({email:email}).table('users')

            if (result.length > 0) {
                return result[0]
            }else {
                return undefined
            }
        } catch (err) {
            console.log(err)
            return undefined
        }

    }

}

module.exports = new User()