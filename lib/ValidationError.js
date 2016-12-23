/**
 * Error to return when a caller passes a bad parameter
 * @param message
 * @param error
 * @constructor
 */
var ValidationError = function (message, error) {
    Error.call(this, message);
    Error.captureStackTrace(this, this.constructor);
    this.name = 'ValidationError';
    this.message = message;
    if (error) this.inner = error;
};

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

module.exports = ValidationError;