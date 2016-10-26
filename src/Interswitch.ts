/**
 * Interswitch SDK 
 */

interface InterswitchEnvironment {
    ENV_SANDBOX: String;
    ENV_PRODUCTION: String;

}


class Interswitch {
    clientid: String;
    clientSecret: String;
    environment: String;
    passportBaseUrl: String;
    serviceUrl: Object;
    InterswitchEnv: InterswitchEnvironment;
    InterswitchUrl: Object;

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
     * Sets the Environment 
     */
    setEnvironment(environmentMode: String) {
        if (environmentMode === this.InterswitchEnv.ENV_SANDBOX) {
            this.environment = this.InterswitchEnv.ENV_SANDBOX
        }
        else if (environmentMode === this.InterswitchEnv.ENV_PRODUCTION) {
            this.environment = this.InterswitchEnv.ENV_PRODUCTION
        }
    }


sendWithAccessToken(url,method,datam httpHeaders, signedParameters){

}   
send(url,method,datam httpHeaders, signedParameters){
    
}   
    




}