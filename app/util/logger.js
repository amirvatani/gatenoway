const { createLogger,combine,timestamp, transports, config } = require('winston');


const transactionLogger = createLogger({
   transports: [
        new transports.File({ filename: 'logs/gateway.log' , options: { flags: 'w' }})
     ]
});

module.exports = {
    transactionLogger: transactionLogger
};