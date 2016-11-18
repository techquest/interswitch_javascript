```js
var Interswitch = require('interswitch')
var clientId = ""; // Get your Client ID from https://developer.interswitchng.com
var secret = ""; // Get your Client Secret from https://developer.interswitchng.com
var ENV = "SANDBOX"; // or PRODUCTION
var interswitch = new Interswitch(clientId, secret, ENV);

var handleResponse = function(err, response, responseData)
{
   console.log("HTTP Response Code: " + response.statusCode);
   console.log("Response body: " + responseData);
}

var httpHeaders = {
	Content-Type: application/json
}
var requestData = "";
interswitch.send("api/v1/.....", "POST", requestData, httpHeaders, handleResponse);
```

## Installation

```bash
$ npm install interswitch
```

## Features

  * Sends request to Interswitch API
  * Calculates Interswitch Security Header
  * Packages Interswitch Sensitive Data (Card, PIN, CVV, Exp Date)
  * Generates PIN Block for Interswitch transactions
  * Generate MAC for Interswitch transactions
  
