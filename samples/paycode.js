var express = require('express');
var Interswitch = require('interswitch');
var jwt = require('jsonwebtoken');
var server = express();
var clientid = "IKIA9614B82064D632E9B6418DF358A6A4AEA84D7218";
var secret = "XCTiBtLy1G9chAnyg0z3BcaFK4cVpwDg/GTw2EmjTZ8=";
var interswitchSDK = new Interswitch(clientid, secret);
var userAccessToken = "eyJhbGciOiJSUzI1NiJ9.eyJsYXN0TmFtZSI6IkpBTSIsIm1lcmNoYW50X2NvZGUiOiJNWDE4NyIsInByb2R1Y3Rpb25fcGF5bWVudF9jb2RlIjoiMDQyNTk0MTMwMjQ2IiwidXNlcl9uYW1lIjoiYXBpLWphbUBpbnRlcnN3aXRjaGdyb3VwLmNvbSIsInJlcXVlc3Rvcl9pZCI6IjAwMTE3NjE0OTkyIiwibW9iaWxlTm8iOiIyMzQ4MDk4Njc0NTIzIiwicGF5YWJsZV9pZCI6IjIzMjQiLCJjbGllbnRfaWQiOiJJS0lBOTYxNEI4MjA2NEQ2MzJFOUI2NDE4REYzNThBNkE0QUVBODRENzIxOCIsImZpcnN0TmFtZSI6IkFQSSIsImVtYWlsVmVyaWZpZWQiOnRydWUsImF1ZCI6WyJjYXJkbGVzcy1zZXJ2aWNlIiwiaXN3LWNvbGxlY3Rpb25zIiwiaXN3LXBheW1lbnRnYXRld2F5IiwicGFzc3BvcnQiLCJ2YXVsdCJdLCJzY29wZSI6WyJwcm9maWxlIl0sImV4cCI6MTQ3OTQyNzAwNiwibW9iaWxlTm9WZXJpZmllZCI6dHJ1ZSwianRpIjoiZWEwODk0ZmMtN2EyMC00NDA0LWI0YTAtNzU0NDZkZTg0ZmEwIiwiZW1haWwiOiJhcGktamFtQGludGVyc3dpdGNoZ3JvdXAuY29tIiwicGFzc3BvcnRJZCI6IjYxMWRmNzZhLWI0MzItNDczNy05YzY0LTc2MDdkYWRjYWNhZCIsInBheW1lbnRfY29kZSI6IjA1MTQxOTgxNTQ2ODUifQ.XZnR_dTw3rsay-QkFJtCcmBUP7n8gHZ1zHPSey_HjRRwExYlaFA0rjb0IadLA9WMYaEOGYyoa8KoNqx1UPtErEKm7txW4ei6rSr3_vvV8NQ3rEVJS8kn9SwjhsMIopQlgqiVmv97uxzotJpB0iGAHgnKy3HA2b9THZvyj5dIP943mYaT_n7jW9aGsmsQcdxKrrLdycaIYbL9FqT7A-3PnMcS-D79D5WPaH3t70CtUMSt9sJYc6aLt5MNi_bCpx8ti83l6amjRICO1vS9ElvdwA6ca2hsD2Vjx8eSmt_F8iZESuzUZUunZ04jONTSXPbz4ahn4R7eXqi5qqn5dO4-JQ";

server.use(express.static(__dirname + '/public'));

var getResponse = function(err, response, body)
{
console.log("Exception: " + err);
var httpRespCode =  response.statusCode
console.log("Generate Paycode HTTP Resp Code: " + httpRespCode);
console.log("Generate Paycode Resp: " + body);
}


var handleGetPaymentMethod = function(err, response, body)
{
//console.log("Exception: " + err);
var httpRespCode =  response.statusCode
console.log("Get PaymentMethod HTTP Resp Code: " + httpRespCode);
console.log("Get PaymentMethod Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200')
{
var ttid = "812";
var decoded = jwt.decode(userAccessToken);
var msisdn = decoded.mobileNo;
var paymentMethodIdentifier = json.paymentMethods[1].token;
//var expDate = "5004";
var expDate = "1909";
//var cvv = "111";
var cvv = "123";
//var pin = "1111";
var pin = "1234";
var pwmChannel = "ATM";
var tokenLifeInMin = "90";
var otp = "1234";
var amt = "500000";
var tranType = "Withdrawal";
var secure = interswitchSDK.getSecureData(null, expDate, cvv, pin, null, msisdn, ttid);
var secureData = secure.secureData;
var pinData = secure.pinBlock;
var macData = secure.mac;

var httpHeader = {
	frontendpartnerid: 'WEMA'
}

var generatePaycode = '{ "amount": "' + amt + '", "ttid": "' + ttid + '", "transactionType": "' + tranType + '", "paymentMethodIdentifier": "' + paymentMethodIdentifier + '", "payWithMobileChannel": "' + pwmChannel + '", "tokenLifeTimeInMinutes": "' + tokenLifeInMin + '", "oneTimePin": "' + otp + '", "pinData": "' +  pinData + '", "secure":" ' + secureData + '", "macData": "' + macData + '"}';
console.log("\nGenerate Paycode Req: " + generatePaycode);
interswitchSDK.sendWithAccessToken("api/v1/pwm/subscribers/" + msisdn + "/tokens", "POST", userAccessToken, generatePaycode, httpHeader, getResponse);

}
else
{
console.log("Cannot get payment method");
}
}

interswitchSDK.sendWithAccessToken("api/v1/ewallet/instruments", "GET", userAccessToken, handleGetPaymentMethod);

