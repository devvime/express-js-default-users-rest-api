var jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
    const authToken = req.headers['authorization']
    if (authToken != undefined) {
        const bearer = authToken.split(' ')
        var token = bearer[1]
        
        try {
            var decoded = jwt.verify(authToken, process.env.SECRET)
            next()
        } catch (error) {
            res.status(403)
            res.json({error: "Access denied!"})
            return
        }

    }else {
        res.status(403)
        res.json({error: "Access denied!"})
        return
    }
}