# Interswitch SDK JavaScript

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
var authData=InterswitchClient.getAuthData("5061020000000000011","1801","350","1111");
```

