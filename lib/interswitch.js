/**
 * This extends the RequestError
 * @class RequestError
 * @extends {Error}
 */
class HttpConfigurationError extends Error {
   constructor(message) {
        super(message);
    }
}

//Please uncomment import statement in JS before taking via babel as TS
//won't generate the ES6 import as Node doesn't understand this
var IswSecurity = require('./auth');
//var axios = require('axios');
var httpRequest = require('request');
var SecureManager = require('./secure');
var Promise = require('es6-promise');


/** @constructor */
function Interswitch(clientid, secret, environment = null)
{
        this.clientid = clientid;
        this.clientSecret = secret;
        this.accessToken = null;
        this.InterswitchUrl = {
            PRODUCTION_BASE_URL: "https://saturn.interswitchng.com/",
            SANDBOX_BASE_URL: "https://sandbox.interswitchng.com/",
            PRODUCTION_PASSPORT_BASE_URL: "https://saturn.interswitchng.com",
            SANDBOX_PASSPORT_BASE_URL: "https://sandbox.interswitchng.com",
	    PASSPORT_OAUTH_RESOURCE_URL: "passport/oauth/token",
        };
        this.serviceUrl = {
            PASSPORT_OAUTH_TOKEN: "/passport/oauth/token"
        };
        this.InterswitchEnv = {
            ENV_SANDBOX: "SANDBOX",
            ENV_PRODUCTION: "PRODUCTION"
        };
        if (environment != null) {
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
        }
    };




    /**
     * Sends a call to Passport to generate AccessToken before making the original call
     * @param {String} url
     * @param {String} method
     * @param {Object} data
     * @param {Object} httpHeaders
     * @param {Array<String>} signedParameters
     * @returns {Promise<Object>}
     *
     * @memberOf Interswitch
     */
Interswitch.prototype.send = function() {
	
	var arglen = arguments.length;
	var callback = arglen >= 1 ? arguments[arglen - 1] : null;
	var url = arglen >= 2 ? arguments[0] : null;
	var method = arglen >= 3 ? arguments[1] : null;
	var data = arglen >= 4 ? arguments[2] : null;
	var httpHeaders = arglen >= 5 ? arguments[3] : null;
	var signedParameters = arglen >= 6 ? arguments[4] : null;

        if (url === null || url === undefined) {
            throw new HttpConfigurationError("Url must be specified beofre making the Request");
        }
        if (method === null || method === undefined || method === "") {
            throw new HttpConfigurationError('HTTP Verb must be defined, please check your method type');
        }
        url = this.getBaseUrl() + url;
        let RequestParameter = {
            url: url,
            method: method,
            secret: this.clientSecret,
            clientId: this.clientid,
            extraData: signedParameters
        };

        //Call Passport
        let passportBaseUrl = this.getPassportBaseUrl();
        passportBaseUrl += this.serviceUrl.PASSPORT_OAUTH_TOKEN;
        
	//prepare the passport request data
        //    data:"grant_type=client_credentials&scope=profile",
        let PassportRequestData = {
            url: passportBaseUrl,
            method: "POST",
            extraData: null,
            secret: this.clientSecret,
            clientId: this.clientid,
            contentType: "application/x-www-form-urlencoded"
        };

        //Generate the Interswitch header
        let headerData = IswSecurity.getHeader(RequestParameter, httpHeaders, true);
        
	//Create the Request data
        let requestData = {
            method: PassportRequestData.method,
            url: PassportRequestData.url,
            body: "grant_type=client_credentials&scope=profile",
            headers: {
                Authorization: headerData.Authorization,
                'Content-Type': PassportRequestData.contentType
            }
        };

	
	// request npm implementation
	httpRequest(requestData, function(error, response, body){
	   
	    var json = JSON.parse(body);
	    //console.log("Response Code: " + response.statusCode);
	    //console.log("Response Body: " + body);
	    //console.log("JSON data: " + json.access_token);
	    this.accessToken = json.access_token;
            
	    //make the Call to Original Request Url
            let OriginalRequestParameter = {
                url: this.url,
                method: this.method,
                clientId: this.clientid,
                secret: this.clientSecret,
                contentType: "application/json",
                extraData: this.signedParameters,
                encryptedMethod: "SHA1",
                accessToken: this.accessToken
            };


	    let headerData2 = IswSecurity.getHeader(OriginalRequestParameter, httpHeaders, false);
            
	   //Create the Request data
            let requestData2 = {
                method: OriginalRequestParameter.method,
                url: OriginalRequestParameter.url,
                body: data,
                headers: headerData2
            };

	    if(OriginalRequestParameter.method == "GET")
	    {
		requestData2 = {
			method: OriginalRequestParameter.method,
        	        url: OriginalRequestParameter.url,
                	headers: headerData2
		}
	    } 

	   // console.log("Data: " + JSON.stringify(requestData2));

		httpRequest(requestData2, function(error, response, body){
			//console.log("Error Log: " + error);
			//console.log("Second Response: " + response.statusCode);
			//console.log("Second Body: " + body);
			if(typeof callback === "function")
			{
				callback(error, response, body);
			}
		}
		);
	}.bind({clientid: this.clientid, clientSecret: this.clientSecret, url: url, method: method, signedParameters: signedParameters})
	);

	
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
Interswitch.prototype.sendWithAccessToken = function() {

        var arglen = arguments.length;
        var callback = arglen >= 1 ? arguments[arglen - 1] : null;
        var url = arglen >= 2 ? arguments[0] : null;
        var method = arglen >= 3 ? arguments[1] : null;
	var accessToken = arglen >= 4 ? arguments[2] : null;
        var data = arglen >= 5 ? arguments[3] : null;
        var httpHeaders = arglen >= 6 ? arguments[4] : null;
        var signedParameters = arglen >= 7 ? arguments[5] : null;        

if (url === null || url === undefined) {
            throw new HttpConfigurationError("Url must be specified beofre making the Request");
        }
        if (method === null || method === undefined || method === "") {
            throw new HttpConfigurationError('HTTP Verb must be defined, please check your method type');
        }
        
	url = this.getBaseUrl() + url;
	let RequestParameter = {
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
        let headerData = IswSecurity.getHeader(RequestParameter, httpHeaders, false);
        
	//Create the Request data
        let requestData = {
            method: RequestParameter.method,
            url: RequestParameter.url,
            body: data,
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

	//console.log("Data: " + JSON.stringify(requestData));
        
        httpRequest(requestData, function(error, response, body){
                        //console.log("Error Log: " + error);
                        //console.log("Second Response: " + response.statusCode);
                        //console.log("Second Body: " + body);
                        if(typeof callback === "function")
                        {
                                callback(error, response, body);
                        }
                }
                );

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
Interswitch.prototype.getAuthData = function(pan, expDate, cvv, pinString, publicModulus = null, publicExponent = null) {
        let SecureAuthData = {
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
Interswitch.prototype.getSecureData = function(pan, expDate, cvv, pin, amount = null, mobile = null, ttId = null, publicModulus = null, publicExponent = null){
	
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
        else {
            return this.InterswitchUrl.SANDBOX_BASE_URL;
        }
    };


Interswitch.prototype.getPassportBaseUrl = function() {
        if (this.environment === this.InterswitchEnv.ENV_PRODUCTION) {
            return this.InterswitchUrl.PRODUCTION_PASSPORT_BASE_URL;
        }
        else {
            return this.InterswitchUrl.SANDBOX_PASSPORT_BASE_URL;
        }
    };


module.exports = Interswitch;
