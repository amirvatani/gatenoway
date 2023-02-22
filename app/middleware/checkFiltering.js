const crypto = require("crypto");
const {  user } = require("../model");
const { transactionLogger } = require("../util/logger.js");
const {
  CONTRACT_NOT_FOUND_MESSAGE,
  CHECK_FILTERING_ENABLED,
} = require("../constant/environment");
const { filtering } = require("../constant/filtering");

const returnError = async (data, res, req, customErrorMessage) => {
  const userObject = await user.findByPk(req.userId);
  userObject.warned = userObject.warned + 1;
  userObject.save();

  const id = crypto.randomBytes(16).toString("hex");

  transactionLogger.error(
    `new error : ${customErrorMessage ?? CONTRACT_NOT_FOUND_MESSAGE} ` +
      JSON.stringify({ ...data, rayId: id
       })
  );
  return res.status(400).json({
    message: `${
      customErrorMessage ?? CONTRACT_NOT_FOUND_MESSAGE
    }, Forbidden Transaction!`,
    RayId: id,
  });
};

function checkFiltering(req, res, next) {

  if (!CHECK_FILTERING_ENABLED) {
    return next();
  }

  
  const wholeText =  JSON.stringify({
    headers: req.headers,
    method: req.method,
    url: req.url,
    httpVersion: req.httpVersion,
    body: req.body,
    cookies: req.cookies,
    path: req.path,
    protocol: req.protocol,
    query: req.query,
    params: req.params,
    hostname: req.hostname,
    ip: req.ip,
    originalUrl: req.originalUrl,
    params: req.params,
});
  let status = false;
  filtering.forEach((i) => {
    if(wholeText.includes(i)){
      status = i
    }
  });
  if (status) {
    return returnError({ filteredWord: status }, res, req,"something illegal found in request");
  }else{
    next()
  }
}

module.exports = {
  checkFiltering,
};
