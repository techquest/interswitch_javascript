var Payment = require('paymentsdk');

var clientid = "IKIA9614B82064D632E9B6418DF358A6A4AEA84D7218";
var secret = "XCTiBtLy1G9chAnyg0z3BcaFK4cVpwDg/GTw2EmjTZ8=";
var payment = new Payment(clientid, secret);
var amt = "35000";
var currency = payment.NAIRA;
var custId = "customer@myshop.com";
var id = "13";


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
    var tranId = json.paymentId;
    if(!tranId && json.transactionRef)
    {
      tranId = json.transactionRef; // This is returned for ValdiateCard response.
    }
    payment.verifyOTP(tranId, otp, getResp);
  }
  else if(httpRespCode == '202' && json.responseCode == 'M0') {
     console.log('This cards needs to be registered for OTP');
  }
  else 
  {
    // Get Payment Status
    payment.getStatus(json.transactionRef, amt, getResp);
  }
}


// Payment - No OTP
var pan = "6280511000000095";
var expDate = "5004";
var cvv = "111";
var pin = "1111";
var paymentReqRef = "ISW-SDK-PAYMENT-" + id;
payment.authorize(pan, expDate, cvv, pin, amt, currency, custId, paymentReqRef, getPaymentResp);


// Card Validation - No OTP
var validateReqRef = "ISW-SDK-VALIDATE-" + id;
payment.validateCard(pan, expDate, cvv, pin, validateReqRef, getPaymentResp);


// Payment requires OTP
var otpPan = "5061020000000000011";
var otpExpDate = "1801";
var otpCvv = "350";
var otpPin = "1111";
var otpPaymentReqRef = "ISW-SDK-PAYMENT-OTP-" + id;
payment.authorize(otpPan, otpExpDate, otpCvv, otpPin, amt, currency, custId, otpPaymentReqRef, getPaymentResp);


// Card Validation - requires OTP
var otpValidateReqRef = "ISW-SDK-VALIDATE-OTP-" + id;
payment.validateCard(otpPan, otpExpDate, otpCvv, otpPin, otpValidateReqRef, getPaymentResp);


