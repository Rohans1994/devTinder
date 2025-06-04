const User = require("../models/user")
const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) =>{
    try {
        const {token} = req.cookies;
        if(!token){
            throw new Error("Invalid Token, Please login");
        }
        const decoded = await jwt.verify(token,"rohansecret@123" );
        const user = await User.findById(decoded._id);
        if(!user){
            throw new Error("User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {userAuth};