var Interswitch = require('interswitch');
var clientid = "IKIA9614B82064D632E9B6418DF358A6A4AEA84D7218";
var secret = "XCTiBtLy1G9chAnyg0z3BcaFK4cVpwDg/GTw2EmjTZ8=";
var interswitchSDK = new Interswitch(clientid, secret);
var amt = "3500";
var id = "6";

var getResp = function(err, response, body)
{
console.log("Status HTTP Resp Code: " + response.statusCode);
console.log("Status Resp: " + body);
}

var getRegisterOTPResp = function(err, response, body)
{
}


// handle Payment Response
var getPaymentResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("HTTP Resp Code: " + httpRespCode);
console.log("Response: " + body);
var json = JSON.parse(body);


if(httpRespCode == '202' && json.responseCode == 'T0') {
// Do OTP Authorization
var otp = "123456"; // You are supposed to get this on your mobile phone.
var otpData = '{ "paymentId": "' + json.paymentId + '", "otp": "' + otp + '" }'
if(!json.paymentId && json.transactionRef)
{
otpData = '{ "transactionRef": "' + json.transactionRef + '", "otp": "' + otp + '" }'
}
console.log("OTP Request: " + otpData);
interswitchSDK.send("api/v2/purchases/otps/auths", "POST", otpData, getResp);
}

else if(httpRespCode == '202' && json.responseCode == 'M0') {
console.log('This cards needs to be registered for OTP');
}

else {
// Get Payment Status
var httpHeader = {
        transactionRef:json.transactionRef,
        amount: amt
};
interswitchSDK.send("api/v2/purchases", "GET", null, httpHeader, getResp);
}

}


// Payment - No OTP
var pan = "6280511000000095";
var expDate = "5004";
var cvv = "111";
var pin = "1111";
var authData = interswitchSDK.getAuthData(pan, expDate, cvv, pin);
var paymentTranRef = "ISW-SDK-PAYMENT-" + id;
var payment = '{ "amount": "' + amt + '", "customerId": "customer@myshop.com", "transactionRef": "' + paymentTranRef + '", "authData": "' + authData + '", "currency": "NGN"}';
console.log("\nPayment Req: " + payment);
interswitchSDK.send("api/v2/purchases", "POST", payment, getPaymentResp);



// Card Validation - No OTP
var otpValidateTranRef = "ISW-SDK-VALIDATE-" + id;
var validate = '{ "transactionRef": "' + otpValidateTranRef + '", "authData": "' + authData + '"}';
console.log("\nValidate Req: " + validate);
interswitchSDK.send("api/v2/purchases/validations", "POST", validate, getPaymentResp);



// Payment requires OTP
var otpPan = "5061020000000000011";
var otpExpDate = "1801";
var otpCvv = "350";
var otpPin = "1111";
var otpAuthData = interswitchSDK.getAuthData(otpPan, otpExpDate, otpCvv, otpPin);
var otpPaymentTranRef = "ISW-SDK-PAYMENT-OTP-" + id;
var otpPayment = '{ "amount": "' + amt + '", "customerId": "customer@myshop.com", "transactionRef": "' + otpPaymentTranRef + '", "authData": "' + otpAuthData + '", "currency": "NGN"}';
console.log("\nOTP Payment Req: " + otpPayment);
interswitchSDK.send("api/v2/purchases", "POST", otpPayment, getPaymentResp);



// Card Validation - requires OTP
var otpValidateTranRef = "ISW-SDK-VALIDATE-OTP-" + id;
var otpValidate = '{ "transactionRef": "' + otpValidateTranRef + '", "authData": "' + otpAuthData + '"}';
console.log("\nOTP Validate Req: " + otpValidate);
interswitchSDK.send("api/v2/purchases/validations", "POST", otpValidate, getPaymentResp);





//var accessToken = "eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiaXN3LWNvbGxlY3Rpb25zIiwiaXN3LXBheW1lbnRnYXRld2F5IiwicGFzc3BvcnQiLCJ2YXVsdCJdLCJtZXJjaGFudF9jb2RlIjoiTVgxODciLCJwcm9kdWN0aW9uX3BheW1lbnRfY29kZSI6IjA0MjU5NDEzMDI0NiIsInJlcXVlc3Rvcl9pZCI6IjAwMTE3NjE0OTkyIiwic2NvcGUiOlsicHJvZmlsZSJdLCJleHAiOjE0NzkyODU1MDcsImp0aSI6ImRiN2EyYzAwLTg4MDctNGRkNC1iZjUxLThkZjllZGY2OWUxZCIsInBheWFibGVfaWQiOiIyMzI0IiwiY2xpZW50X2lkIjoiSUtJQTk2MTRCODIwNjRENjMyRTlCNjQxOERGMzU4QTZBNEFFQTg0RDcyMTgiLCJwYXltZW50X2NvZGUiOiIwNTE0MTk4MTU0Njg1In0.JwH-ZwTxE3xeLFt39TGXZJ_3YLvfLhTnvuoj31cd-akBY9AJrY4zQuQC7wSLw69xaANH0TgDtvD2BnSF-HZsmVqDtD6KRxGxgzoyyAiK8L6O06iYGYhlihidwB87UWLOuD05pZfiUnWgM6WGMgKSrJ43ZRPBdFk5HjBS3ABsC3XrUCDtrUxqd7rZXsDADoZ09rjvhrHOkPOqJEkPgL-eI2B2MMUtK6Ks8gyG0ybDjf1O5g2DtVuyDqx3D7jm0NYgEK3yRqOxOCYHgoeFcmYm1QPkJzOF0fSsnFAvCh3VwQ8cMd9TpccQaf-Tlm883cm0lpSVp-d5AdOQd55NXMLXzg";
//interswitchSDK.sendWithAccessToken("api/v1/quickteller/categorys", "GET", accessToken, {}, httpHeader, responseProc);

