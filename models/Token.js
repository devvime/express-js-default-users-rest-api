const res = require('express/lib/response')
var knex = require('../database/connection')
var User = require('./User')

class Token {

    async create(email) {
        var user = await User.findByEmail(email)
        if (user != undefined) {
            try {
                var token = Date.now()
                await knex.insert({
                    user_id: user.id,
                    used: 0,
                    token: token
                }).table('password_tokens')
                return {status: true, token: token}
            } catch (error) {
                console.log(error)
                return {status: false, error: error}
            }
        }else {
            return {status: false, error: "User not registered!"}
        }
    }

    async validate(token) {
        try {
            var result = await knex.select().where({token: token}).table('password_tokens')
            if (result.length > 0) {
                var tk = result[0]
                if (tk.used) {
                    return {status: false}
                }else {
                    return {status: true, token: tk}
                }
            }else {
                return {status: false}
            }
        } catch (error) {
            console.log(error)
            return {status: false}
        }
    }

    async setUsed(token) {
        await knex.update({used: 1}).where({token: token}).table('password_tokens')
    }

}

module.exports = new Token()