/**
 * Interswitch SDK
 */
class Interswitch {
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
     * Sets the Environment
     */
    setEnvironment(environmentMode) {
        if (environmentMode === this.InterswitchEnv.ENV_SANDBOX) {
            this.environment = this.InterswitchEnv.ENV_SANDBOX;
        }
        else if (environmentMode === this.InterswitchEnv.ENV_PRODUCTION) {
            this.environment = this.InterswitchEnv.ENV_PRODUCTION;
        }
    }
    sendWithAccessToken(url, method, datam = httpHeaders, signedParameters) {
    }
    send(url, method, datam = httpHeaders, signedParameters) {
    }
}
