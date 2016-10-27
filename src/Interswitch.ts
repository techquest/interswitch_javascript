declare var SecureManager;
interface InterswitchEnvironment {
    ENV_SANDBOX: String;
    ENV_PRODUCTION: String;

}

interface SecureAuthOptions{
    publicKeyModulus:String;
    publicKeyExponent:String;
    card:String;
    exp:String;
    cvv:String;
    pin:String;
}


/**
 * This extends the RequestError  
 * @class RequestError
 * @extends {Error}
 */
class HttpConfigurationError extends Error{
    constructor(message){
        super(message);
    }
}
//Please uncomment import statement in JS before taking via babel as TS
//won't generate the ES6 import as Node doesn't understand this


//import getHeader from "./auth";
//import axios from "axios";
//import SecureManager from "./lib/secure"
export default class Interswitch {
    clientid: String;
    clientSecret: String;
    environment: String;
    passportBaseUrl: String;
    serviceUrl: Object;
    InterswitchEnv: InterswitchEnvironment;
    InterswitchUrl: Object;
    resourceUri:String;

    constructor(clientid: String, secret: String) {
        this.clientid = clientid;
        this.clientSecret = secret;
        this.InterswitchUrl = {
            PASSPORT_OAUTH_RESOURCE_URL: "passport/oauth/token",
            PRODUCTION_BASE_URL: "https://saturn.interswitchng.com/"
        }

        this.InterswitchEnv = {
            ENV_SANDBOX: "SANDBOX",
            ENV_PRODUCTION: "PRODUCTION"
        }

    }
    
    /**
     * Sets the Environment for the Request
     * 
     * @param {String} environmentMode
     * 
     * @memberOf Interswitch
     */
    setEnvironment(environmentMode: String) {
        if (environmentMode === this.InterswitchEnv.ENV_SANDBOX) {
            this.environment = this.InterswitchEnv.ENV_SANDBOX
        }
        else if (environmentMode === this.InterswitchEnv.ENV_PRODUCTION) {
            this.environment = this.InterswitchEnv.ENV_PRODUCTION
        }
    }


sendWithAccessToken(url:String,method:String,data:Object,httpHeaders:Object, signedParameters:Array<String>){

}



   
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
send(url:String,method:String,data:Object|String, httpHeaders:Object, signedParameters:Array<String>){
    if(url === null || url === undefined){
        throw new HttpConfigurationError("Url must be specified beofre making the Request");
    }

    if(method === null || method === undefined || method === ""){
        throw new HttpConfigurationError('HTTP Verb must be defined, please check your method type');
    }


}

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
getAuthData(publicModulus:String,publicExponent:String,  pan:String, expDate:String, cvv:String, pinString){
    let SecureAuthData:SecureAuthOptions={
        publicKeyModulus:publicModulus,
        publicKeyExponent:publicExponent,
        card:pan,
        exp:expDate,
        cvv:cvv,
        pin:pinString
    }

    return SecureManager.authData2(SecureAuthData);
}  
    




}