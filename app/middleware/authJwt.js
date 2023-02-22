const jwt = require("jsonwebtoken");
var requestIp = require('request-ip');
/******************/
const {JWT_SECRET_KEY} = require("#constant/environment");
const db = require("#model/index");
/******************/

const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "Unauthorized!"
    });
  }

  jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    const userObject = await User.findByPk(decoded.id);
    const userRoles = await userObject.getRoles();

    let clientIp = requestIp.getClientIp(req); 
    if(userObject.ip && userObject.ip !== clientIp){
      return res.status(401).send({
        message: "Invalid client!"
      });
    }
  
    let warnLimit = 0;
    let rateLimit = 0;

    userRoles.forEach(role => {
      if(role.warnLimit > warnLimit){
        warnLimit = role.warnLimit;
        rateLimit= role.rateLimit;
      }
    });
    
    if(userObject.warned >= warnLimit){
      return res.status(401).send({
        message: "You reached invalid request limit! call administrator of system!"
      });
    }

    if(!userObject.isActive){
      return res.status(401).send({
        message: "Your account suspended!"
      });
  
    }

    req.rateLimit = rateLimit;
    req.userRoles = userRoles;
    
    next();
   
  });
};


const authJwt = {
  verifyToken: verifyToken
};
module.exports = authJwt;
