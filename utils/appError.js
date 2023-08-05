class AppError extends Error {
    constructor(message , statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // turn on this err in operation error

        Error.captureStackTrace(this ,this.constructor) //this in here so we can call constructor function any way in app
    }
}

module.exports = AppError