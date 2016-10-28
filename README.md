# Interswitch SDK JavaScript
SAMPLE CLIENTID/secret

IKIAC168FB93E4D021D50F42D66759CF029A94324CE0 -> Client ID
mtL1t8REuYGcDm7ggpn13kyi9YhXSKPbwhGPgLw/Xg0= -> Secret

Usage

Instantitate the Client Class
```javascript
var InterswitchClient = new Interswitch(clientId,secret,"SANDBOX");

```

or
```javascript
var InterswitchClient = new Interswitch(clientId,secret,"PRODUCTION");

```
Making an API Call
```javascript
callback=InterswitchClient.send("api/v1/quickteller/transactions/inquirys","POST",Data,{
          terminalId:'3APJ0001'
        },null);
callback.then(SuccessCallback,ErrorCallback);        

```

Generating AuthData

Arguments(cardpan,expdate,cvv,pin)
```javascript
var authData=InterswitchClient.getAuthData(CARD_PAN,EXPIRY_DATE,CVV,PIN);
```

Making Payment API Calls

# After Getting the user details
```javascript
var PurchaseData = {
                "customerId":CUSTOMER_ID_OR_MOBILE,
                "amount": AMOUNT,
                "transactionRef": "ESBDEV"+(Math.random() * 1000),
                "currency": "NGN",
                "authData": authData,
                "merchantCode": "MX187", //MERCHANT
                "payableId": "2324" //ITEM
    };
```
# Making the Call
```javascript
try{
        var callback=InterswitchClient.send("api/v2/purchases","POST", PurchaseData, {}, null);
    callback.then(function(response){
        if (response.data.responseCode === "T0") {
                    //this.state = this.scenario.OTP;
                    //OTP PHASE
            var OTPData = {
            //"authData": this.authData, NO COMPULSORY
            "paymentId": response.data.paymentId,
            "otp": "645001"
            };

            var callback=InterswitchClient.send("api/v2/purchases/otps/auths","POST", OTPData, {}, null);
        }
    })
    .catch( function(error){
        console.log(error);
    });
    }
    catch(e){
        console.log(e);
    }    
```
