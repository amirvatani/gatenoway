const crypto = require("crypto");
const { contract, user } = require("../model");
var validate = require("jsonschema").validate;
const { transactionLogger } = require("../util/logger.js");
const db = require("../model");
const {XSS_DETECTION_ENABLED,XSS_ATTACK_ERROR_MESSAGE,CONTRACT_NOT_FOUND_MESSAGE,XSS_CONFIDENCE_FACTOR,CHECK_CONTRACTS_ENABLED,REQUEST_USER_HAS_INVALID_ROLE_MESSAGE} = require("../constant/environment");


const attackDetection = require('xss-attack-detection');
const xss_detect = new attackDetection.xssAttackDetection();

const returnError = async (data, res, req , customErrorMessage) => {
  const userObject = await user.findByPk(req.userId);
  userObject.warned = userObject.warned + 1;
  userObject.save();

  const id = crypto.randomBytes(16).toString("hex");

  transactionLogger.error(
    `new error : ${customErrorMessage ?? CONTRACT_NOT_FOUND_MESSAGE} ` + JSON.stringify({ ...data, rayId: id })
  );
  return res.status(400).json({
    message:`${customErrorMessage ?? CONTRACT_NOT_FOUND_MESSAGE}, Forbidden Transaction!`,
    RayId : id
  })
 
};

function checkContract(req, res, next) {
  if(CHECK_CONTRACTS_ENABLED == "false"){
    return next()
  }
  const url = new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);

  contract
    .findOne({
      where: {
        httpVersion: "1.1",
        method: req.method,
        url: url.pathname,
      },
    })
    .then((contract) => {

      if (contract && contract.isActive) {

      
        const isValidRole = req.userRoles.find(
          (role) => role.id === contract.roleId
        );

        if (!isValidRole) {
          return returnError(
            {
              message: REQUEST_USER_HAS_INVALID_ROLE_MESSAGE,
              contractRoleId: contract.roleId,
              userRoles: req.userRoles,
            },
            res,
            req
          );
        }


        const bodyValidation = !!contract.body
          ? validate(req.body, JSON.parse(contract.body))
          : null;
        const paramsValidation = !!contract.params
          ? validate(req.params, JSON.parse(contract.params))
          : null;
        const queryValidation = !!contract.query
          ? validate(req.query, JSON.parse(contract.query))
          : null;

        if (!!contract.body ? !bodyValidation.valid : false) {
          return returnError(bodyValidation.errors, res, req);
        }

        if (!!contract.params ? !paramsValidation.valid : false) {
          return returnError(paramsValidation.errors, res, req);
        }

        if (!!contract.query ? !queryValidation.valid : false) {
          return returnError(queryValidation.errors, res, req);
        }

        req.contract = contract;
        if(XSS_DETECTION_ENABLED){
          if(req.body){
            const isXSS = xss_detect.detect(JSON.stringify(req.body))
            if(isXSS.confidenceFactor > parseFloat(XSS_CONFIDENCE_FACTOR)){
              return returnError({isXSS}, res, req , `${XSS_ATTACK_ERROR_MESSAGE} body` );
            }
          }
          if(req.params){
            const isXSS = xss_detect.detect(JSON.stringify(req.params))
            if(isXSS.confidenceFactor > parseFloat(XSS_CONFIDENCE_FACTOR)){
              return returnError({isXSS}, res, req , `${XSS_ATTACK_ERROR_MESSAGE} params` );
            }
          }
          if(req.query){
            const isXSS = xss_detect.detect(JSON.stringify(req.query))
            if(isXSS.confidenceFactor > parseFloat(XSS_CONFIDENCE_FACTOR)){
              return returnError({isXSS}, res, req , `${XSS_ATTACK_ERROR_MESSAGE} query` );
            }
          }
        }
        next();
      } else {
        const {
          rawHeaders,
          remoteAddress,
          httpVersion,
          method,
          headers,
          body,
          params,
          query,
          originalUrl,
          path,
        } = req;
        returnError(
          {
            message: "contract is empty",
            rawHeaders,
            remoteAddress,
            httpVersion,
            method,
            headers,
            body,
            params,
            query,
            originalUrl,
            path,
          },
          res,
          req
        );
      }
    })
    .catch((error) => {
      console.log(error,"error")
      const {
        rawHeaders,
        remoteAddress,
        httpVersion,
        method,
        headers,
        body,
        params,
        query,
        originalUrl,
        path,
      } = req;
      returnError(
        {
          error,
          errorString: JSON.stringify(error),
          rawHeaders,
          remoteAddress,
          httpVersion,
          method,
          headers,
          body,
          params,
          query,
          originalUrl,
          path,
        },
        res,
        req
      );
    });
}

module.exports = {
  checkContract,
};
