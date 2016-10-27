import { Buffer } from 'buffer/';
import jsSHA from "jssha";


const _encodeUrl = function (url) {
	return encodeURIComponent(url);
};

const encodeExtraData = function (extraData) {
	var encoded = '';
	for (var i = 0, lens = extraData.length; i < lens; i++) {
		encoded += _encodeUrl(extraData[i]) + '&';
	};
	return encoded = encoded.substr(0, encoded);
};

// GUID Generate a unique ID
const generateUUID = function () {
	var d = new Date().getTime();
	var uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};

const optionsCheck = (options) => {
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

export const signature = (options) => {
	console.log(options);
	if (!optionsCheck(options)) return false;
	let url = _encodeUrl(options.url.replace('http://', 'https://'));
	let secret = options.secret ? options.secret : '';
	let clientId = options.clientId ? options.clientId : '';
	let accessToken = options.accessToken ? options.accessToken : '';
	let method = options.method;
	let terminalId = options.terminalId;
	let timeStamp = parseInt(Date.now().toString().substr(0, 10));
	let nonce = generateUUID();
	let encryptedMethod = options.encryptionMethod || 'SHA-512';
	let extraData = options.extraData ? h.encodeExtraData(options.extraData) : '';
	let baseStringToBeSigned = method + "&" + url + "&" + timeStamp + "&" + nonce + "&" + clientId + "&" + secret;
	if (extraData) {
		encryptedMethod = +'&' + extraData;
	}
	let shaObj = new jsSHA(encryptedMethod, "TEXT");// sha;
	shaObj.update(baseStringToBeSigned);
	let hash = shaObj.getHash("B64");
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
export const getBase64 = (str) => {
	return new Buffer(str).toString('base64');
};

export const getPassportHeader=(clientid,secret)=>{
	return getBase64(clientid+":"+secret);
}


const getHeader = (cryptOptions, allowedHeader,isPassport) => {
	let secret, clientId, accessToken;
	let signed = signature(cryptOptions);
	let contentType = cryptOptions.contentType || 'application/json';
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

export default getHeader;
