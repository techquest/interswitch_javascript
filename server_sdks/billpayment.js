var Interswitch = require('interswitch');
var clientid = "IKIAF6C068791F465D2A2AA1A3FE88343B9951BAC9C3";
var secret = "FTbMeBD7MtkGBQJw1XoM74NaikuPL13Sxko1zb0DMjI=";
var interswitchSDK = new Interswitch(clientid, secret);
var pan = "6280511000000095";
var expDate = "5004";
var cvv = "111";
var pin = "1111";
var amt = "350000";
var mobile = "08032296227";

var httpHeader = {
	terminalId:'3APJ0001'
};


// handle QuickTeller  BillPayment Response
var getBillPaymentResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Bill Payment HTTP Resp Code: " + httpRespCode);
console.log("Bill Payment Resp: " + body);

}


// Handle QuickTeller Inquiry Response
var handleInquiryResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Inquiry HTTP Resp Code: " + httpRespCode);
console.log("Inquiry Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200' && json.ResponseCode == '90000')
{
var tranRef = json.TransactionRef;
var secure = interswitchSDK.getSecureData(pan, expDate, cvv, pin, amt);
var secureData = secure.secureData;
var pinData = secure.pinBlock;
var billpayment = '{ "amount": "' + amt + '", "cardBin":"' + pan.substring(0, 11)+ '", "msisdn": "' + mobile + '", "transactionRef": "' + tranRef + '", "secureData": "' + secureData + '", "pinData": "' + pinData + '"}';
console.log("\nBill Payment Req: " + billpayment);
interswitchSDK.send("api/v1/quickteller/transactions", "POST", billpayment, httpHeader, getBillPaymentResp);
}
else
{
console.log('Inquiry failed');
}
}


// Handle QuickTeller Get PaymentItem Response
var handlePaymentItemResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Get PaymentItems HTTP Resp Code: " + httpRespCode);
//console.log("Get PaymentItems Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200')
{
var inquiry = '{"requestReference": "ISW-SDK-8", "customerId": "08084650069", "paymentCode": "90106" }';
console.log("\nInquiry Req: " + inquiry);
interswitchSDK.send("api/v1/quickteller/transactions/inquirys", "POST", inquiry, httpHeader, handleInquiryResp);
}
else
{
console.log("Failed to get Quickteller Payment Items");
}
}



// Handle QuickTeller Get Billers Response
var handleBillerResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Get Billers HTTP Resp Code: " + httpRespCode);
//console.log("Get Billers Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200')
{
// 901 - Airtel
interswitchSDK.send("api/v1/quickteller/billers/901/paymentitems","GET",{}, httpHeader, handlePaymentItemResp);
}
else
{
console.log("Failed to get Quickteller Billers");
}
}



// Handle QuickTeller Get Categories Response
var handleCategoryResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Get Categorys HTTP Resp Code: " + httpRespCode);
//console.log("Get Category Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200')
{
// 4 - Recharge
// 2 - Cable
// 18 - Transfer
interswitchSDK.send("api/v1/quickteller/categorys/4/billers","GET",{}, httpHeader, handleBillerResp);
}
else
{
console.log("Failed to get Quickteller Biller Categories");
}
}

interswitchSDK.send("api/v1/quickteller/categorys","GET",{}, httpHeader, handleCategoryResp);






//var accessToken = "eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiaXN3LWNvbGxlY3Rpb25zIiwiaXN3LXBheW1lbnRnYXRld2F5IiwicGFzc3BvcnQiLCJ2YXVsdCJdLCJtZXJjaGFudF9jb2RlIjoiTVgxODciLCJwcm9kdWN0aW9uX3BheW1lbnRfY29kZSI6IjA0MjU5NDEzMDI0NiIsInJlcXVlc3Rvcl9pZCI6IjAwMTE3NjE0OTkyIiwic2NvcGUiOlsicHJvZmlsZSJdLCJleHAiOjE0NzkyODU1MDcsImp0aSI6ImRiN2EyYzAwLTg4MDctNGRkNC1iZjUxLThkZjllZGY2OWUxZCIsInBheWFibGVfaWQiOiIyMzI0IiwiY2xpZW50X2lkIjoiSUtJQTk2MTRCODIwNjRENjMyRTlCNjQxOERGMzU4QTZBNEFFQTg0RDcyMTgiLCJwYXltZW50X2NvZGUiOiIwNTE0MTk4MTU0Njg1In0.JwH-ZwTxE3xeLFt39TGXZJ_3YLvfLhTnvuoj31cd-akBY9AJrY4zQuQC7wSLw69xaANH0TgDtvD2BnSF-HZsmVqDtD6KRxGxgzoyyAiK8L6O06iYGYhlihidwB87UWLOuD05pZfiUnWgM6WGMgKSrJ43ZRPBdFk5HjBS3ABsC3XrUCDtrUxqd7rZXsDADoZ09rjvhrHOkPOqJEkPgL-eI2B2MMUtK6Ks8gyG0ybDjf1O5g2DtVuyDqx3D7jm0NYgEK3yRqOxOCYHgoeFcmYm1QPkJzOF0fSsnFAvCh3VwQ8cMd9TpccQaf-Tlm883cm0lpSVp-d5AdOQd55NXMLXzg";
//interswitchSDK.sendWithAccessToken("api/v1/quickteller/categorys", "GET", accessToken, {}, httpHeader, responseProc);

