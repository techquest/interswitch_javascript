"use strict";
"use strict";
var Buffer = require('buffer/').Buffer;
var jsSHA = require('jssha');


var _encodeUrl = function (url) {
	return encodeURIComponent(url);
};

var encodeExtraData = function (extraData) {
	var encoded = '';
	for (var i = 0, lens = extraData.length; i < lens; i++) {
		encoded += _encodeUrl(extraData[i]) + '&';
	};
	return encoded = encoded.substr(0, encoded);
};

// GUID Generate a unique ID
var generateUUID = function () {
	var d = new Date().getTime();
	var uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};

var optionsCheck = (options) => {
	if (!options) {
		throw "No option  parameter specified";
		return false;
	}
	if (!options.accessToken) {
		if (!options.clientId) {
			throw "No clientId Specified";
		}
		if (!options.secret) {
			throw "No secret specified";
			return false;
		}
	}

	if (!options.url) {
		throw "No endpoint url";
		return false;
	}
	return true;
};

var signature = function (options){
	//console.log(options);
	if (!optionsCheck(options)) return false;
	var url = _encodeUrl(options.url.replace('http://', 'https://'));
	var secret = options.secret ? options.secret : '';
	var clientId = options.clientId ? options.clientId : '';
	var accessToken = options.accessToken ? options.accessToken : '';
	var method = options.method;
	var terminalId = options.terminalId;
	var timeStamp = parseInt(Date.now().toString().substr(0, 10));
	var nonce = generateUUID();
	var encryptedMethod = options.encryptionMethod || 'SHA-512';
	var extraData = options.extraData ? h.encodeExtraData(options.extraData) : '';
	var baseStringToBeSigned = method + "&" + url + "&" + timeStamp + "&" + nonce + "&" + clientId + "&" + secret;
	if (extraData) {
		encryptedMethod = +'&' + extraData;
	}
	var shaObj = new jsSHA(encryptedMethod, "TEXT");// sha;
	shaObj.update(baseStringToBeSigned);
	var hash = shaObj.getHash("B64");
	return {
		hash,
		url,
		secret,
		clientId,
		accessToken,
		method,
		url,
		terminalId,
		timeStamp,
		nonce,
		encryptedMethod,
		extraData,
	};
};

// Base 64
var getBase64 = function(str){
	return new Buffer(str).toString('base64');
};

var getPassportHeader= function(clientid,secret){
	return getBase64(clientid+":"+secret);
}


exports.getHeader = function(cryptOptions, allowedHeader,isPassport)
{
	var secret, clientId, accessToken;
	var signed = signature(cryptOptions);
	var contentType = cryptOptions.contentType || 'application/json';
	var headers = {
		'Authorization': cryptOptions.accessToken ? `Bearer ${cryptOptions.accessToken}` : `InterswitchAuth ${getBase64(_encodeUrl(cryptOptions.clientId))}`,
		'Timestamp': signed.timeStamp,
		'Nonce': signed.nonce,
		'Signature': signed.hash,
		'SignatureMethod': signed.encryptedMethod,
		'Content-Type': contentType,
	};
	if(isPassport){
		headers['Authorization']="Basic "+getPassportHeader(cryptOptions.clientId,cryptOptions.secret);
	}
	if (allowedHeader instanceof Object)
		for (var props in allowedHeader) {
			headers[props] = allowedHeader[props];
		}
	return headers;
};

