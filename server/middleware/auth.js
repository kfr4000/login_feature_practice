const { User } = require('../model/user.js')

let auth = (req,res, next) => {

    //인증처리를 하는 곳

    //client의 cookie에서 Token을 가져온다
    let token = req.cookies.x_auth;

    //token을 복호화한 후 user를 찾는다
    User.findByToken(token, (err, user) => {
        if(err) throw(err)
        if(!user) return res.json({isAuth: false, error: true})
        
        req.token = token;
        req.user = user;
        next();
    })
    //user가 있으면 인증 O, user가 없으면 인증 X

}

module.exports = {auth};