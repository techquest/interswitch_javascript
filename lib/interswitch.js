"use strict";

var IswSecurity = require('./auth');
var httpRequest = require('request');
var SecureManager = require('./secure');
var Promise = require('es6-promise');
var ValidationError = require('./ValidationError.js');

function Interswitch(clientid, secret, environment)
{
        this.clientid = clientid;
        this.clientSecret = secret;
        this.accessToken = null;
        this.InterswitchUrl = {
            PRODUCTION_BASE_URL: "https://saturn.interswitchng.com/",
            SANDBOX_BASE_URL: "https://sandbox.interswitchng.com/",
            PRODUCTION_PASSPORT_BASE_URL: "https://saturn.interswitchng.com/",
            SANDBOX_PASSPORT_BASE_URL: "https://sandbox.interswitchng.com/",
	        PASSPORT_OAUTH_RESOURCE_URL: "passport/oauth/token",
            DEV_BASE_URL:"https://qa.interswitchng.com/",
            DEV_PASSPORT_URL: "http://172.26.40.117:6060/"
        };
        this.serviceUrl = {
            PASSPORT_OAUTH_TOKEN: "passport/oauth/token"
        };
        this.InterswitchEnv = {
            ENV_SANDBOX: "SANDBOX",
            ENV_PRODUCTION: "PRODUCTION",
            ENV_DEVELOPMENT: "DEVELOPMENT"
        };
        if (environment !== undefined) {
            this.environment = environment;
        }
        else {
            this.environment = this.InterswitchEnv.ENV_SANDBOX;
        }
}



    /**
     * Sets the Environment for the Request
     *
     * @param {String} environmentMode
     *
     * @memberOf Interswitch
     */
Interswitch.prototype.setEnvironment = function(environmentMode) {
        if (environmentMode === this.InterswitchEnv.ENV_SANDBOX) {
            this.environment = this.InterswitchEnv.ENV_SANDBOX;
        }
        else if (environmentMode === this.InterswitchEnv.ENV_PRODUCTION) {
            this.environment = this.InterswitchEnv.ENV_PRODUCTION;
        }else {
            //throw exception or accept a reasonable default
        }
    };

Interswitch.prototype.simpleSend = function(options, callback) {
    //access token should be in the options obj

    var url = options.url;
    var method = options.method;
    var data = options.requestData;
    var httpHeaders = options.httpHeaders;
    var signedParameters = options.signedParameters;
    var access = options.accessToken;
    url = this.getBaseUrl() + url;

    var OriginalRequestParameter = {
        url: url,
        method: method,
        clientId: this.clientid,
        secret: this.clientSecret,
        contentType: "application/json",
        extraData: signedParameters,
        encryptedMethod: "SHA1",
        accessToken: access
    };


    var headerData = IswSecurity.getHeader(OriginalRequestParameter, httpHeaders, false);

    //Create the Request data
    var requestData = {
        method: OriginalRequestParameter.method,
        url: OriginalRequestParameter.url,
        body: JSON.stringify(data),
        headers: headerData
    };

    if(OriginalRequestParameter.method == "GET")
    {
        requestData = {
            method: OriginalRequestParameter.method,
            url: OriginalRequestParameter.url,
            headers: headerData
        }
    }

    //make http request
    httpRequest(requestData, function(err, response, body){

            if(err) {
                return callback(err);
            }
            else {
                callback(null, response, body);

            }

        }
    );



};

/**
 * Sends a call to Passport to generate AccessToken before making the original call
 * @param {object} options
 * @param {String} url
 * @param {String} method
 * @param {Object} data
 * @param {Object} httpHeaders
 * @param {Array<String>} signedParameters
 * @param {function} callback
 * @returns {Promise<Object>}
 *
 * @memberOf Interswitch
 */


Interswitch.prototype.send = function(options, callback) {
    if ((typeof options === 'function') && !callback) {
        callback = options;
        options = {};
        console.log("created new options");
    }

    if (!options) {
        console.log("created new options");
        options = {};

    }

    if(!(typeof callback === 'function')) {

        return new ValidationError("Callback must be specified before making the Request");
    }

    if(options.url === undefined) {

        return callback(new Error("Url must be specified before making the Request "+options.url));
    }

    if(options.method === undefined) {

        return callback(new Error("HTTP Verb must be defined, please check your method type"));

    }
    //call to get access token
    this.getNewAccessToken(function(err, access, res){

        if(err) {
            callback(err);
        }else {
            if(access === undefined || access === null) {
            }else { // access token is well defined here
                options.accessToken = access;
                this.simpleSend(options, function(err, response, body){
                    if(err) {
                        //send err msg
                        callback(err);
                    }else {
                        callback(null, response, body);
                    }
                });
            }

        }
    }.bind(this));
};

/**
 * This sends an HTTP Request to the url resource
 *
 * @param {String} url
 * @param {String} method
 * @param {Object} data
 * @param {Object} httpHeaders
 * @param {Array<String>} signedParameters
 *
 * @memberOf Interswitch
 */
Interswitch.prototype.sendWithAccessToken = function(options, callback) {

    //validation

    if ((typeof options === 'function') && !callback) {
        callback = options;
        options = {};
    }

    if (!options) {

        options = {};

    }

    if(!(typeof callback === 'function')) {

        //throw an exception
        throw {message : "Callback must be specified before making the Request"};
    }

    if(options.url === undefined) {
        //throw validation error
        return callback(new Error("Url must be specified before making the Request"));
    }

    if(options.method === undefined) {
        //throw exception error
        return callback(new Error("HTTP Verb must be defined, please check your method type"));
    }

    var url = options.url;
    var method = options.method;
    var accessToken = options.accessToken;
    var data = options.requestData;
    var httpHeaders = options.httpHeaders;
    var signedParameters = options.signedParameters;

    url = this.getBaseUrl() + url;

    var RequestParameter = {
        url: url,
        method: method,
        clientId: this.clientid,
        secret: this.clientSecret,
        contentType: "application/json",
        extraData: signedParameters,
        encryptedMethod: "SHA1",
        accessToken: accessToken
    };
    //Generate the Interswitch header
    var headerData = IswSecurity.getHeader(RequestParameter, httpHeaders, false);

    //Create the Request data
    var requestData = {
        method: RequestParameter.method,
        url: RequestParameter.url,
        body: JSON.stringify(data),
        headers: headerData
    };

    if(RequestParameter.method == "GET")
    {
        requestData = {
            method: RequestParameter.method,
            url: RequestParameter.url,
            headers: headerData
        }
    }
    httpRequest(requestData, function(error, response, body){
            
        if(error) {
            console.log("network error: "+error);
            return callback(error);
        }

        if(typeof callback === "function")
        {
            return callback(null, response, body);
        }
    });



};

    /**
     * Generates the AuthData
     *
     * @param {String} publicExponent
     * @param {String} publicModulus
     * @param {String} pan
     * @param {String} expDate
     * @param {String} cvv
     * @param {any} pinString
     * @returns AuthData String
     *
     * @memberOf Interswitch
     */
Interswitch.prototype.getAuthData = function(options) {
    //pan, expDate, cvv, pinString, publicModulus, publicExponent
    var pan = options.pan || null;
    var expDate = options.expDate || null;
    var cvv = options.cvv || null;
    var pinString = options.pin || null;
    var publicModulus = options.publicModulus || null;
    var publicExponent = options.publicExponent || null;

    var SecureAuthData = {
        publicKeyModulus: publicModulus != null ? publicModulus : "009c7b3ba621a26c4b02f48cfc07ef6ee0aed8e12b4bd11c5cc0abf80d5206be69e1891e60fc88e2d565e2fabe4d0cf630e318a6c721c3ded718d0c530cdf050387ad0a30a336899bbda877d0ec7c7c3ffe693988bfae0ffbab71b25468c7814924f022cb5fda36e0d2c30a7161fa1c6fb5fbd7d05adbef7e68d48f8b6c5f511827c4b1c5ed15b6f20555affc4d0857ef7ab2b5c18ba22bea5d3a79bd1834badb5878d8c7a4b19da20c1f62340b1f7fbf01d2f2e97c9714a9df376ac0ea58072b2b77aeb7872b54a89667519de44d0fc73540beeaec4cb778a45eebfbefe2d817a8a8319b2bc6d9fa714f5289ec7c0dbc43496d71cf2a642cb679b0fc4072fd2cf",
        publicKeyExponent: publicExponent != null ? publicExponent : "010001",
        card: pan,
        exp: expDate,
        cvv: cvv,
        pin: pinString
    };
    return SecureManager.authData(SecureAuthData);
};



    /**
    * @param {String} pan
    * @param {String} expDate
    * @param {String} cvv
    * @param {String} pin
    * @param {String} amount
    * @param {String} mobile
    * @param {String} publicModulus
    * @param {String} publicExponent
    * @returns secureData, pinBlock, mac
    */
Interswitch.prototype.getSecureData = function(options){

    //validate options
    //pan, expDate, cvv, pin, amount, mobile, ttId, publicModulus, publicExponent
    var pan = options.pan || null;
    var expDate = options.expDate || null;
    var cvv = options.cvv || null;
    var pin = options.pin || null;
    var amount = options.amount || null;
    var mobile = options.mobile || null;
    var ttId = options.ttId || null;
    var publicModulus = options.publicModulus || null;
    var publicExponent = options.publicExponent || null;
	
	var secureOptions = {
		expiry: expDate,
		pan: pan,
		amount: amount,
		mobile: mobile,
		ttId: ttId		
	};
	
	var pinData = {
		pin: pin,
		cvv: cvv,
		expiry: expDate
	};
	
	return SecureManager.generateSecureData(secureOptions, pinData);
};




    /**
     * Returns the access token if the access token has been set
     *
     * @returns {(String|Boolean)}
     *
     * @memberOf Interswitch
     */
Interswitch.prototype.getAccessToken = function() {

        if (this.accessToken !== null) {
            return this.accessToken;
        }
        else {
            return false;
        }
  };


Interswitch.prototype.getBaseUrl = function() {
        if (this.environment === this.InterswitchEnv.ENV_PRODUCTION) {
            return this.InterswitchUrl.PRODUCTION_BASE_URL;
        }
        else if(this.environment === this.InterswitchEnv.ENV_DEVELOPMENT){
            return this.InterswitchUrl.DEV_BASE_URL;
        }
        else {
            return this.InterswitchUrl.SANDBOX_BASE_URL;
        }
    };


Interswitch.prototype.getPassportBaseUrl = function() {
        if (this.environment === this.InterswitchEnv.ENV_PRODUCTION) {
            return this.InterswitchUrl.PRODUCTION_PASSPORT_BASE_URL;
        }
        else if(this.environment === this.InterswitchEnv.ENV_DEVELOPMENT){
            return this.InterswitchUrl.DEV_PASSPORT_URL;
        }
        else {
            return this.InterswitchUrl.SANDBOX_PASSPORT_BASE_URL;
        }
};



Interswitch.prototype.getNewAccessToken = function(callback){

    
    var passportBaseUrl = this.getPassportBaseUrl() + this.serviceUrl.PASSPORT_OAUTH_TOKEN;
    console.log("passport base url "+passportBaseUrl);
    var passportRequestData = {
        url: passportBaseUrl,
        method: "POST",
        extraData: null,
        secret: this.clientSecret,
        clientId: this.clientid,
        contentType: "application/x-www-form-urlencoded"
    };

    var headerData = IswSecurity.getHeader(passportRequestData, {}, true);

    //Create the Request data
    var requestData = {
        method: passportRequestData.method,
        url: passportRequestData.url,
        body: "grant_type=client_credentials&scope=profile",
        headers: {
            Authorization: headerData.Authorization,
            'Content-Type': passportRequestData.contentType
        }
    };

    httpRequest(requestData, function(error, response, body) {


        if (error) {
            console.log("\n"+JSON.stringify(error)+"\n");
            return callback(error);
        }else {
            var json = JSON.parse(body);



            this.accessToken = json.access_token;

            var accessToken = json.access_token;

            return callback(null, accessToken, response);
        }

    });
};

module.exports = Interswitch;