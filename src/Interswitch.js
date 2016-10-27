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
import getHeader from "./auth";
import axios from "axios";
import SecureManager from "./lib/secure"
export default class Interswitch {
    constructor(clientid, secret) {
        this.clientid = clientid;
        this.clientSecret = secret;
        this.InterswitchUrl = {
            PASSPORT_OAUTH_RESOURCE_URL: "passport/oauth/token",
            PRODUCTION_BASE_URL: "https://saturn.interswitchng.com/"
        };
        this.InterswitchEnv = {
            ENV_SANDBOX: "SANDBOX",
            ENV_PRODUCTION: "PRODUCTION"
        };
    }
    /**
     * Sets the Environment for the Request
     *
     * @param {String} environmentMode
     *
     * @memberOf Interswitch
     */
    setEnvironment(environmentMode) {
        if (environmentMode === this.InterswitchEnv.ENV_SANDBOX) {
            this.environment = this.InterswitchEnv.ENV_SANDBOX;
        }
        else if (environmentMode === this.InterswitchEnv.ENV_PRODUCTION) {
            this.environment = this.InterswitchEnv.ENV_PRODUCTION;
        }
    }
    sendWithAccessToken(url, method, data, httpHeaders, signedParameters) {
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
    send(url, method, data, httpHeaders, signedParameters) {
        if (url === null || url === undefined) {
            throw new HttpConfigurationError("Url must be specified beofre making the Request");
        }
        if (method === null || method === undefined || method === "") {
            throw new HttpConfigurationError('HTTP Verb must be defined, please check your method type');
        }
        let RequestParameter = {
            url: url,
            method: method,
            secret: this.clientSecret,
            clientId: this.clientid,
            extraData: signedParameters
        };
        //Generate the Interswitch header
        let headerData = getHeader(RequestParameter, httpHeaders, false);
        //Create the Axios Request data
        let AxiosData = {
            method: RequestParameter.method,
            url: RequestParameter.url,
            data: data,
            headers: headerData
        };
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
    getAuthData(publicModulus, publicExponent, pan, expDate, cvv, pinString) {
        let SecureAuthData = {
            publicKeyModulus: publicModulus,
            publicKeyExponent: publicExponent,
            card: pan,
            exp: expDate,
            cvv: cvv,
            pin: pinString
        };
        return SecureManager.authData2(SecureAuthData);
    }
}
