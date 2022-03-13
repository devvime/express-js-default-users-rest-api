class HomeController{

    async index(req, res){
        res.send("API USERS");
    }

}

module.exports = new HomeController();