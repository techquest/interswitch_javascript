'use strict';
/**
 *  Sample code to show usage of the send function
 **/
var jwt = require('jsonwebtoken');
var Interswitch = require('../lib/interswitch.js');
var clientId = "IKIA9614B82064D632E9B6418DF358A6A4AEA84D7218";
var secret = "XCTiBtLy1G9chAnyg0z3BcaFK4cVpwDg/GTw2EmjTZ8=";
var access_token = "eyJhbGciOiJSUzI1NiJ9.eyJsYXN0TmFtZSI6IkpBTSIsIm1lcmNoYW50X2NvZGUiOiJNWDE4NyIsInByb2R1Y3Rpb25fcGF5bWVudF9jb2RlIjoiMDQyNTk0MTMwMjQ2IiwidXNlcl9uYW1lIjoiYXBpLWphbUBpbnRlcnN3aXRjaGdyb3VwLmNvbSIsInJlcXVlc3Rvcl9pZCI6IjAwMTE3NjE0OTkyIiwibW9iaWxlTm8iOiIyMzQ4MDk4Njc0NTIzIiwicGF5YWJsZV9pZCI6IjIzMjQiLCJjbGllbnRfaWQiOiJJS0lBOTYxNEI4MjA2NEQ2MzJFOUI2NDE4REYzNThBNkE0QUVBODRENzIxOCIsImZpcnN0TmFtZSI6IkFQSSIsImVtYWlsVmVyaWZpZWQiOnRydWUsImF1ZCI6WyJjYXJkbGVzcy1zZXJ2aWNlIiwiaXN3LWNvbGxlY3Rpb25zIiwiaXN3LXBheW1lbnRnYXRld2F5IiwicGFzc3BvcnQiLCJ2YXVsdCJdLCJzY29wZSI6WyJwcm9maWxlIl0sImV4cCI6MTQ4MjM2NTA2NiwibW9iaWxlTm9WZXJpZmllZCI6dHJ1ZSwianRpIjoiMjgxOTI4NzQtZmI1Ni00Yzc5LThkMjAtYWI5MWEzMmQwYzBiIiwiZW1haWwiOiJhcGktamFtQGludGVyc3dpdGNoZ3JvdXAuY29tIiwicGFzc3BvcnRJZCI6IjYxMWRmNzZhLWI0MzItNDczNy05YzY0LTc2MDdkYWRjYWNhZCIsInBheW1lbnRfY29kZSI6IjA1MTQxOTgxNTQ2ODUifQ.FqZZDGAhc4h1o0ag4c5c1JVvjywdjvaWpgYwprjlEK2tKr3hXJfFv075HTEcAjLwsRft8pNjfial0KYkkrQv426_8--GKzsVyuH3GAeU6vBbwhi8xdfZmuhn_UKpDOo7TKfNuUT6lQpLTnznRDEHDd0S6bQOYFtTDNfJWshJ4nZ2gBpvzWMGa2w1-10hSaGb1vTdOgPHcnrxGfrMhb7gve8OHUT1072dgWkYd1DHmxFYmP1Kg6ZlCJgcSsxH4DWoBdHY6MEbGano_ySttdjDrLoGa4tpSUkN0cv0pmjKKrYwoD_5CEGOE3td4hZIQuhT7WVuAQowVoNvf95bp6y_Eg"


var ENV = "SANDBOX"; // or PRODUCTION

var interswitch = new Interswitch(clientId, secret, ENV);

//start: sample get authData call


var pan = "6280511000000095";
var expDate = "1909";
var cvv = "123";
var pin = "1234";


var authData = interswitch.getAuthData({pan:pan, expDate:expDate, cvv:cvv, pin:pin});

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
    interswitch.send(obj,function(err, res, res2){
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

    interswitch.send({
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

var sampleGetEwallet = function() {

    //do EWallet call now
    interswitch.sendWithAccessToken({
        url: "api/v1/ewallet/instruments",
        method: "GET",
        accessToken: access_token
    }, function(err, response, body){
        if(err) {
            console.log("error from paycode "+JSON.stringify(err));

        }else {
            console.log("response from paycode "+JSON.stringify(response));

        }
    });

};

var sampleGetPaycode = function() {

    //get Ewallet and get payment token from it
    interswitch.sendWithAccessToken({
        url: "api/v1/ewallet/instruments",
        method: "GET",
        accessToken: access_token
    }, function(err, response, body){
        if(err) {
            console.log("error from paycode "+JSON.stringify(err));

        }else {

            //response = JSON.parse(response);
            //body = JSON.parse(body);

            //console.log(typeof response.body+"\n"+JSON.stringify(response.body["paymentMethods"])+"\n");
            var bodyObj = JSON.parse(response.body);
            if(response.statusCode === 200 || response.statusCode === 201) {

                var paymentToken = bodyObj.paymentMethods[1].token;
                var id = getUniqueId();
                var ttid = Math.floor(Math.random() * 900) + 100;
                var decoded = jwt.decode(access_token);
                var msisdn = decoded.mobileNo;
                var secureRequestObj = {
                    expDate:expDate,
                    cvv:cvv,
                    pin:pin,
                    mobile:msisdn,
                    ttId:ttid
                };
                var secure = interswitch.getSecureData(secureRequestObj);
                var secureData = secure.secureData;
                var pinData = secure.pinBlock;
                var macData = secure.mac;
                var httpHeader = {
                    frontendpartnerid: 'WEMA'
                };
                var req = {
                    "amount": 100000,
                    "ttid": ttid ,
                    "transactionType": 'Withdrawal',
                    "paymentMethodIdentifier": paymentToken ,
                    "payWithMobileChannel": 'ATM' ,
                    "tokenLifeTimeInMinutes":'100',
                    "oneTimePin": '1111',
                    "pinData": pinData,
                    "secure":secureData ,
                    "macData":macData
                };
                interswitch.sendWithAccessToken({
                    url: "api/v1/pwm/subscribers/" + msisdn + "/tokens",
                    method: 'POST',
                    accessToken:access_token,
                    httpHeaders: httpHeader,
                    requestData: req
                }, function(err, response, body){
                    if(err) {
                        console.log("err from paycode "+JSON.stringify(err));
                    }else {
                        var paycodeObj = JSON.parse(response.body);
                        if(response.statusCode === 200 || response.statusCode === 201) {
                            console.log("paycode is : "+paycodeObj.payWithMobileToken);
                        }else {
                            console.log("unable to generate paycode");
                        }

                    }

                });
                //make a generate paycode call

            }else {

                console.log("Unable to generate paycode");
            }

        }
    });


};

//start: call

//sampleValidation();
//samplePurchase();
//sampleGetEwallet();
sampleGetPaycode();

