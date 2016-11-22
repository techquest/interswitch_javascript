var express = require('express');
var httpRequest = require('request');
var Interswitch = require('interswitch');
var Paycode = require('paycode');
var jwt = require('jsonwebtoken');
var Buffer = require('buffer/').Buffer;


fs = require('fs');
var Sample = {}
var server = express();

var clientid = "IKIA9614B82064D632E9B6418DF358A6A4AEA84D7218";
var secret = "XCTiBtLy1G9chAnyg0z3BcaFK4cVpwDg/GTw2EmjTZ8=";
var interswitchSDK = new Interswitch(clientid, secret);
var paycodeSDK = new Paycode(clientid, secret);

var filePath = __dirname + '/public/index.html';
var redirectUri = "http://41.203.120.54";
var interswitchPassport = "https://sandbox.interswitchng.com/passport/oauth/authorize?client_id=" + clientid + "&response_type=code&scope=profile&redirect_uri=" + redirectUri;


var ttid = "812";
//var expDate = "5004";
var expDate = "1909";
//var cvv = "111";
var cvv = "123";
//var pin = "1111";
var pin = "1234";
var pwmChannel = paycodeSDK.ATM; // Other options: paymentSDK.POS, paymentSDK.AGENT
var tokenLifeInMin = "90";
var otp = "1234";
var amt = "500000";
var tranType = paycodeSDK.WITHDRAWAL; //Other options: paymentSDK.PAYMENT
var fep = 'WEMA';


//server.use(express.static(__dirname + '/public'));


server.get('/', function(req, res)
{

  var handleAccessToken = function(err, response, responseBody)
  {
    //console.log('Exception: ' + err);
    console.log('HTTP Response code: ' + response.statusCode);
    //console.log('HTTP Response Headers: ' + JSON.stringify(response.headers));
    //console.log('Response Body: ' + responseBody);

    var json = JSON.parse(responseBody);
    var accessToken = json.access_token;
    fs.readFile(filePath, 'utf8', function (err,data) {
      if (err) {
       //res.writeHead(404);
       console.log(err);
       res.end('Page not found');
       return console.log(err);
      }
  
     var decoded = jwt.decode(accessToken);
     var cookie = 'access_token=' + accessToken + '; expires=' + (new Date(decoded.exp + '000')).toUTCString();
     res.set('Set-Cookie', cookie)
     res.send(data);
    });
  }


  var code = req.query.code;
  console.log("Token Auth Code: " + code);
  var cookie = req.headers.cookie;
  console.log("Cookies: " + cookie);

  if(typeof code !== 'undefined')
  {
    var base64 = new Buffer(clientid + ":" + secret).toString('base64');
    var requestData = {
      url: 'https://sandbox.interswitchng.com/passport/oauth/token',
      method: 'POST',
      headers: {
       'Authorization': 'Basic ' + base64,
       'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=authorization_code&scope=profile&code=' + code + '&redirect_uri=' +  redirectUri
    };
    console.log("request Data: " + JSON.stringify(requestData));
    httpRequest(requestData, handleAccessToken);
  }
  else if(typeof cookie !== 'undefined')
  {
    var accessToken = cookie.split('=')[1];
    if(typeof accessToken !== 'undefined')
    {
     fs.readFile(filePath, 'utf8', function (err,data) {
      if (err) {
       console.log(err);
       res.end('Page not found');
       return console.log(err);
      }
      res.send(data);
     });
    }
  }
  else
  {
    fs.readFile(filePath, 'utf8', function (err,data) {
     if (err) {
      //res.writeHead(404);
      console.log(err);
      res.end('Page not found');
      return console.log(err);
     }
     //console.log(data);
     res.send(data);
    });
  }

});




server.post('/', function(req, res)
{
 if(req.method == 'POST')
 {
   var chunk = '';
   req.on('data', function(data){
     chunk+= data;
   });

   req.on('end', function () 
   {
       var cookie = req.headers['cookie'];
       var accessToken;
       if(typeof cookie !== 'undefined')
       {
         var accessTokenArr = cookie.split('=');
         accessToken = accessTokenArr[1];
	 console.log("Access Token: " + accessToken);
       }

       //console.log("Access Token: " + accessToken);
       if(typeof accessToken === 'undefined')
       {
	 console.log('Redirecting.....' + interswitchPassport);
	 res.redirect(interswitchPassport);	 
       }
       else
       {
	 var getResponse = function(err, response, body)
	 {
	   console.log("Exception: " + err);
	   var httpRespCode =  response.statusCode
	   console.log("Generate Paycode HTTP Resp Code: " + httpRespCode);
	   console.log("Generate Paycode Resp: " + body);
	   var json = JSON.parse(body);   
           Sample.sendResponse(res, httpRespCode, json);
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
	     var paymentToken = json.paymentMethods[1].token;
	     // Generate Paycode
	     paycodeSDK.generateWithEWallet(accessToken, paymentToken, expDate, cvv, pin, amt, fep, tranType, pwmChannel, tokenLifeInMin, otp, getResponse);
	  }
	  else
	  {
	    Sample.sendResponse(res, httpRespCode, json);
	  }
	 };
	
	// Get eWallet
	paycodeSDK.getEWallet(accessToken, handleGetPaymentMethod);

       }
   });
 }
});


Sample.sendResponse = function(res, httpRespCode, json)
{
  fs.readFile(filePath, 'utf8', function (err,data) {
  if (err) {
    //res.writeHead(404);
    console.log(err);
    res.end('Page not found');
    return console.log(err);
  }

  if(httpRespCode == 200 || httpRespCode == 201)
  {
    var paycode = json.payWithMobileToken;
    console.log("Paycode: " + paycode);
    var tokenLifeMin = "90";
    //console.log(data);
    var label = '<div> <label>Paycode: ' + paycode + ', Token Life Time in Min: ' + tokenLifeMin + '</label> </div>';
  }
  else
  {
    label = '<div> <label>Unable to generate Paycode at this time: (' + json.errors[0].message + ')</label> </div>';
  }
  data = data.replace('<div id="paycode"></div>', label);
  res.send(data);
  });
};



var port = 80;
server.listen(port, function(){
        console.log('server listening on ' + port);
});


