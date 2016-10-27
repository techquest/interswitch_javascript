declare var SecureManager, axios, getHeader, Promise;
interface InterswitchEnvironment {
    ENV_SANDBOX: String;
    ENV_PRODUCTION: String;

}

/**
 * Contract interface for AuthData 
 * @interface SecureAuthOptions
 */
interface SecureAuthOptions {
    publicKeyModulus: String;
    publicKeyExponent: String;
    card: String;
    exp: String;
    cvv: String;
    pin: String;
}


/**
 * Generates the Interface as contract for any Interswitch authentication calls 
 * @interface InterswitchRequestInterface
 */
interface InterswitchHeadersAuth {
    contentType?: String;
    encryptedMethod?: String;
    secret: String;
    clientId: String;
    accessToken?: String | any;
    url: String;
    extraData?: Array<String>,
    method: String;
}

interface AxiosRequestData {
    method: String;
    url: String;
    data: Object,
    headers: any
}




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


//import getHeader from "./auth";
//import axios from "axios";
//import SecureManager from "./lib/secure"
//import * as Promise from "es6-promise"
export default class Interswitch {
    clientid: String;
    clientSecret: String;
    environment: String;
    passportBaseUrl: String;
    serviceUrl: Object;
    InterswitchEnv: InterswitchEnvironment;
    InterswitchUrl: Object;
    resourceUri: String;
    accessToken: String;

    constructor(clientid: String, secret: String, environment: any = null) {
        this.clientid = clientid;
        this.clientSecret = secret;
        this.accessToken = null;
        this.InterswitchUrl = {
            PASSPORT_OAUTH_RESOURCE_URL: "passport/oauth/token",
            PRODUCTION_BASE_URL: "https://saturn.interswitchng.com/",
            //SANDBOX_BASE_URL: "http://172.35.2.6:7073/",
            SANDBOX_BASE_URL: "http://172.35.2.30:19081/",
            DEMO_PASSPORT_BASE_URL: "http://172.35.2.6:7073",
            PRODUCTION_PASSPORT_BASE_URL: "https://saturn.interswitchng.com",
            SANDBOX_PASSPORT_BASE_URL: "http://172.35.2.6:7073"
        }

        this.serviceUrl = {
            PASSPORT_OAUTH_TOKEN: "/passport/oauth/token"
        }

        this.InterswitchEnv = {
            ENV_SANDBOX: "SANDBOX",
            ENV_PRODUCTION: "PRODUCTION"
        }

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
    setEnvironment(environmentMode: String) {
        if (environmentMode === this.InterswitchEnv.ENV_SANDBOX) {
            this.environment = this.InterswitchEnv.ENV_SANDBOX
        }
        else if (environmentMode === this.InterswitchEnv.ENV_PRODUCTION) {
            this.environment = this.InterswitchEnv.ENV_PRODUCTION
        }
    }

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
    send(url: String, method: String, data: Object, httpHeaders: Object, signedParameters: Array<String>): Promise<Object> {
        if (url === null || url === undefined) {
            throw new HttpConfigurationError("Url must be specified beofre making the Request");
        }

        if (method === null || method === undefined || method === "") {
            throw new HttpConfigurationError('HTTP Verb must be defined, please check your method type');
        }

        url=this.getBaseUrl() + url


        let RequestParameter: InterswitchHeadersAuth = {
            url: url,
            method: method,
            secret: this.clientSecret,
            clientId: this.clientid,
            extraData: signedParameters
        }
        //Call Passport
        let passportBaseUrl = this.getPassportBaseUrl();
        passportBaseUrl += this.serviceUrl.PASSPORT_OAUTH_TOKEN;
        //prepare the passport request data
        //    data:"grant_type=client_credentials&scope=profile",
        let PassportRequestData: InterswitchHeadersAuth = {
            url: passportBaseUrl,
            method: "POST",
            extraData: null,
            secret: this.clientSecret,
            clientId: this.clientid,
            contentType: "application/x-www-form-urlencoded"
        }
        //Generate the Interswitch header
        let headerData: any = getHeader(RequestParameter, httpHeaders, true);

        //Create the Axios Request data
        let AxiosData: AxiosRequestData = {
            method: PassportRequestData.method,
            url: PassportRequestData.url,
            data: "grant_type=client_credentials&scope=profile",
            headers: {
                Authorization: headerData.Authorization,
                'Content-Type': PassportRequestData.contentType
            }
        }

        let PassPortPromise: Promise<Object> = axios(AxiosData, httpHeaders);
        return PassPortPromise.then((response) => {
            this.accessToken = response.data.access_token;
            //make the Call to Original Request Url
            let OriginalRequestParameter: InterswitchHeadersAuth = {
                url: url,
                method: method,
                clientId: this.clientid,
                secret: this.clientSecret,
                contentType: "application/json",
                extraData: null,
                encryptedMethod: "SHA1",
                accessToken: this.getAccessToken()
            };

            let headerData = getHeader(OriginalRequestParameter, httpHeaders, false);

            //Create the Axios Request data
            let AxiosData: AxiosRequestData = {
                method: OriginalRequestParameter.method,
                url: OriginalRequestParameter.url,
                data: data,
                headers: headerData
            }

            return axios(AxiosData, httpHeaders);
        }, (error) => {
            let chainedPromise = Promise((resolve, reject) => {
                return reject(error);
            });
            return chainedPromise;
        })
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
    sendWithAccessToken(url: String, method: String, data: Object | String, httpHeaders: Object, signedParameters: Array<String>): Promise<Object> {
        if (url === null || url === undefined) {
            throw new HttpConfigurationError("Url must be specified beofre making the Request");
        }

        if (method === null || method === undefined || method === "") {
            throw new HttpConfigurationError('HTTP Verb must be defined, please check your method type');
        }

        
        url = this.getBaseUrl() + url;
        
        let RequestParameter: InterswitchHeadersAuth = {
            url: url,
            method: method,
            secret: this.clientSecret,
            clientId: this.clientid,
            extraData: signedParameters
        }
        //Generate the Interswitch header
        let headerData: any = getHeader(RequestParameter, httpHeaders, false);

        //Create the Axios Request data
        let AxiosData: AxiosRequestData = {
            method: RequestParameter.method,
            url: RequestParameter.url,
            data: data,
            headers: headerData
        }

        return axios(AxiosData, httpHeaders);



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
    getAuthData(pan: String, expDate: String, cvv: String, pinString, publicModulus: String = null, publicExponent: String = null) {
        let SecureAuthData: SecureAuthOptions = {
            publicKeyModulus: publicModulus != null ? publicModulus : "009c7b3ba621a26c4b02f48cfc07ef6ee0aed8e12b4bd11c5cc0abf80d5206be69e1891e60fc88e2d565e2fabe4d0cf630e318a6c721c3ded718d0c530cdf050387ad0a30a336899bbda877d0ec7c7c3ffe693988bfae0ffbab71b25468c7814924f022cb5fda36e0d2c30a7161fa1c6fb5fbd7d05adbef7e68d48f8b6c5f511827c4b1c5ed15b6f20555affc4d0857ef7ab2b5c18ba22bea5d3a79bd1834badb5878d8c7a4b19da20c1f62340b1f7fbf01d2f2e97c9714a9df376ac0ea58072b2b77aeb7872b54a89667519de44d0fc73540beeaec4cb778a45eebfbefe2d817a8a8319b2bc6d9fa714f5289ec7c0dbc43496d71cf2a642cb679b0fc4072fd2cf",
            publicKeyExponent: publicExponent != null ? publicExponent : "010001",
            card: pan,
            exp: expDate,
            cvv: cvv,
            pin: pinString
        }

        return SecureManager.authData2(SecureAuthData);
    }


    /**
     * Returns the access token if the access token has been set
     * 
     * @returns {(String|Boolean)}
     * 
     * @memberOf Interswitch
     */
    getAccessToken(): String | Boolean {
        if (this.accessToken !== null) {
            return this.accessToken;
        }
        else {
            return false;
        }
    }

    getBaseUrl() {
        if (this.environment === this.InterswitchEnv.ENV_PRODUCTION) {
            return this.InterswitchUrl.PRODUCTION_BASE_URL;
        } else {
            return this.InterswitchUrl.SANDBOX_BASE_URL;
        }
    }

    getPassportBaseUrl() {
        if (this.environment === this.InterswitchEnv.ENV_PRODUCTION) {
            return this.InterswitchUrl.PRODUCTION_PASSPORT_BASE_URL;
        } else {
            return this.InterswitchUrl.SANDBOX_PASSPORT_BASE_URL;
        }
    }





}