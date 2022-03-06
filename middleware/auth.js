const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    try{
        const token = req.cookies.token;
        if(!token) return res.status(401).json({message: 'Unauthorized'});
        const validatedUser = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = validatedUser.id;
        next();
        
    } catch(err){
       return res.status(401).json({message: 'Unauthorized'});
    }

}

module.exports = auth;