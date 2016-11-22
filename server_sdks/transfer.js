var Interswitch = require('interswitch');
var clientid = "IKIAF6C068791F465D2A2AA1A3FE88343B9951BAC9C3";
var secret = "FTbMeBD7MtkGBQJw1XoM74NaikuPL13Sxko1zb0DMjI=";
var interswitchSDK = new Interswitch(clientid, secret);
var pan = "6280511000000095";
var expDate = "5004";
var cvv = "111";
var pin = "1111";
var accountNo = "9999999999";
var amt = "5000000";
var bankId = 0;
var customerMobile = "2348032296227";
var remark = "Transfer to MMM";
var transferPaymentCode = "70101";
var requestReference = "ISW-SDK-TRANSFER-4";

var httpHeader = {
	terminalId:'3APJ0001'
};


// handle QuickTeller Transfer Response
var getTransferResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Bill Payment HTTP Resp Code: " + httpRespCode);
console.log("Bill Payment Resp: " + body);

}


// Handle QuickTeller Inquiry Response
var handleInquiryResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Bill Inquiry HTTP Resp Code: " + httpRespCode);
console.log("Bill Inquiry Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200')
{
var tranRef = json.TransactionRef;
var secure = interswitchSDK.getSecureData(pan, expDate, cvv, pin, amt);
var secureData = secure.secureData;
var pinData = secure.pinBlock;
var transfer = '{ "amount": "' + amt + '", "cardBin":"' + pan.substring(0, 11) + '", "msisdn": "' + customerMobile + '", "transactionRef": "' + tranRef + '", "secureData": "' + secureData + '", "pinData": "' + pinData + '"}';
console.log("\nTransfer Req: " + transfer);
interswitchSDK.send("api/v1/quickteller/transactions", "POST", transfer, httpHeader, getTransferResp);

}
else
{
console.log("Failed to Do successful Inquiry");
}
}



// Handle Name Enquiry Response
var handleNameEnqResp = function(err, response, body)
{
var httpRespCode =  response.statusCode
console.log("Name Enquiry HTTP Resp Code: " + httpRespCode);
console.log("Name Enquiry Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200')
{
var accountName = json.accountName;
var inquiry = '{"requestReference": "' + requestReference + '", "customerId": "' + accountNo + '", "paymentCode": "' + transferPaymentCode + '", "pageFlowValues": "DestinationAccountNumber:' + accountNo + '|Amount:' + amt + '|ReciepientName:' + accountName + '|BankId:' + bankId + '|DestinationAccountType:00|ReciepientPhone:' + customerMobile + '|Remark:'+ remark + '|", "customerEmail": "customer@email.com", "customerMobile": "' + customerMobile + '" }';
console.log("\nInquiry Req: " + inquiry);
interswitchSDK.send("api/v1/quickteller/transactions/inquirys", "POST", inquiry, httpHeader, handleInquiryResp);

}
else
{
console.log('Name Enquiry failed');
}
}



// Handle Get Banks Response
var handleBankListResp = function(err, response, body)
{
console.log("exception: " + err);
var httpRespCode =  response.statusCode
console.log("Get Banks HTTP Resp Code: " + httpRespCode);
//console.log("Get Banks Resp: " + body);
var json = JSON.parse(body);

if(httpRespCode == '200')
{
var banks = json.banks;
var bankCode = "";
for(var key in banks)
{
if(banks.hasOwnProperty(key))
{
if(banks[key].bankName.startsWith("First Bank"))
{
console.log("Selected bank: " + banks[key].bankName);
bankCode = banks[key].bankCode;
cbnCode = banks[key].cbnCode;
bankId = banks[key].id;
}
}
}

//console.log("Bankcode: " + bankCode);
var nameEnqHttpHeader = {
        bankCode: cbnCode,
	accountId: accountNo
};
interswitchSDK.send("api/v1/nameenquiry/banks/accounts/names","GET", {}, nameEnqHttpHeader, handleNameEnqResp);

}
else
{
console.log("Failed to get Bank list");
}
}

interswitchSDK.send("api/v1/quickteller/configuration/fundstransferbanks","GET",null, httpHeader, handleBankListResp);

