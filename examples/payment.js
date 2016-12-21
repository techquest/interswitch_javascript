'use strict';
/**
 *  Sample code to show usage of the send function
 **/

var Interswitch = require('../lib/interswitch.js');
var clientId = "IKIA9614B82064D632E9B6418DF358A6A4AEA84D7218";
var secret = "XCTiBtLy1G9chAnyg0z3BcaFK4cVpwDg/GTw2EmjTZ8=";

var ENV = "SANDBOX"; // or PRODUCTION

var interswitch = new Interswitch(clientId, secret, ENV);

//start: sample get authData call


var pan = "6280511000000095";
var expDate = "5004";
var cvv = "111";
var pin = "1111";


var authData = interswitch.getAuthData(pan, expDate, cvv, pin);

console.log("Auth data: >>> "+authData);

var getUniqueId = function() {
    var id = new Date().getTime();

    id += (id + Math.random() * 16) % 16 | 0;

    return id;
};


var sampleValidation = function() {

    var id = getUniqueId();
    var paymentReqRef = "ISW-SDK-PAYMENT-" + id;
    var req = { "transactionRef": paymentReqRef , "authData": authData };
    //console.log("\nValidate Req: " + req);
    var obj = {
        url: "api/v2/purchases/validations",
        method: "POST",
        requestData: req,
        httpHeaders: {"Content-Type": "application/json"}
    };

    //send the actual request
    interswitch.sendv2(obj,function(err, res, res2){
        if(err) {
            console.log("err in consumer");
            console.log(JSON.stringify(err));
        }else {
            console.log("response was successful");
            console.log(JSON.stringify(res));
        }
    });

};

var samplePurchase = function() {

    var id = getUniqueId();
    var paymentReqRef = "ISW-SDK-PAYMENT-" + id;
    var req = {
        "customerId": "demo@gmail.com",                                  // Email, mobile number, BVN etc to uniquely identify the customer.
        "amount": "100",                                                // Amount in Naira.
        "transactionRef": id,                                           // Unique transaction reference number.
        "currency": "NGN",                                            // ISO Currency code.
        "authData": authData                                           // representative authData
    };

    interswitch.sendv2({
        url: "api/v2/purchases",
        method: "POST",
        requestData: req,
        httpHeaders: {"Content-Type":"application/json"}

    }, function(err, response, body){
        if(err) {
            console.log("err in consumer");
            console.log(JSON.stringify(err));
        }else {
            console.log("response was successful");
            console.log(JSON.stringify(response));
        }

    });

};

var samplePaycodeGetEwallet = function() {

    //requires an access token
    interswitch.getNewAccessToken({
        httpHeaders: {"Content-Type":"application/json"}
    }, function(err, accessToken){
        if(err) {
            console.log("err in passport "+JSON.stringify(err));
        }
        else {
            console.log("access token is : "+accessToken);

            //do EWallet call now
            interswitch.sendWithAccessToken({
                url: "api/v1/ewallet/instruments",
                method: "GET",
                accessToken: accessToken
            }, function(err, response, body){
                if(err) {
                    console.log("error from paycode "+JSON.stringify(err));

                }else {
                    console.log("response from paycode "+JSON.stringify(response));

                }
            });
        }
    });

};

//start: call

sampleValidation();
//samplePurchase();
//samplePaycodeGetEwallet();