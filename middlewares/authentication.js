const { verifyToken } = require("../helpers/jwt")
const {User} = require('../models')
//middleware ada 3. tambah cek subcription n id login
async function authentication(req, res, next) {
    console.log(req.headers, "<<<<<<<<<");
    try{
        //1. Cek apakah user sudah login, jika sudah maka access_token harusnya ada
        // console.log(req.headers.authorization, "ayo dong");
        let bearerToken
        if(!req.body.headers){
            bearerToken = req.headers.authorization
        }else{
            bearerToken = req.body.headers.Authorization

        }
        // console.log(req);
        console.log(bearerToken, "harus masuk");
        if(!bearerToken){
            throw {name: "Invalid Token"}
        }
        //2. Kita harus decode token nya
        const token = bearerToken.split(' ')[1]
        console.log(token, '<<< ini token');
        const decodeToken = verifyToken(token)
        
        //3. Kita perlu validasi ke db apakah id dalam payload ada di db
        const findUser = await User.findByPk(decodeToken.id)
        if(!findUser){ 
            throw {name: "Invalid Token"}
        }
        req.user ={
            id: findUser.id,
            email: findUser.email,
        }
        console.log(req.user.id);
        next()
    }catch (error){
        next(error)
        // console.log(error);
    }
}
module.exports = {authentication}