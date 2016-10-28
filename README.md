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


