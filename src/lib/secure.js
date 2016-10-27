import SECURE_CONFIG from './secure.config';
import forge from './forge.bundle';
const  SecureManager = {};

SecureManager.getNewPinData = function(pin, pinKey) {
    var clearPINBlock = "1" + String(pin).length + String(pin);
    var randomNumber = Math.floor(Randomize()  * 10);
    var pinPadLen = 14 - String(pin).length;
    for (var i = 0; i < pinPadLen; i++) {
        clearPINBlock = clearPINBlock + String(randomNumber);
    }
    var iv = 0x00;
    iv = forge.util.hexToBytes(iv);
    var pinKeyBuffer = forge.util.createBuffer(pinKey);
    pinKeyBuffer.putBytes(pinKey);
    pinKey = pinKeyBuffer.getBytes(24);

    var cipher = forge.cipher.createCipher('3DES-CBC', pinKey);
    var clearPINBlockBytes = forge.util.hexToBytes(clearPINBlock);

    cipher.start({
        iv : iv
    });
    cipher.update(forge.util.createBuffer(clearPINBlockBytes));
    cipher.finish();
    var encrypted = cipher.output;
    var encryptedPinBlock = String(encrypted.toHex());
    return encryptedPinBlock.substring(0, 16);

};

SecureManager.getPinBlock = function(pin, cvv2, expiryDate, pinKey, randNum) {
    if (!pin) {
        pin = "0000";
    }
    if (!cvv2) {
        cvv2 = "000";
    }
    if (!expiryDate) {
        expiryDate = "0000";
    }

    var pinBlockString = pin + cvv2 + expiryDate;
    var pinBlockStringLen = pinBlockString.length;
    var pinBlockStringLenLen = String(pinBlockStringLen).length;
    var clearPinBlock = String(pinBlockStringLenLen) + String(pinBlockStringLen) + pinBlockString;

    var randomNumber = randNum;

    var pinpadlen = 16 - clearPinBlock.length;
    for (var i = 0; i < pinpadlen; i++) {
        clearPinBlock = clearPinBlock + randomNumber;
    }

    var iv = 0x00;
    iv = forge.util.hexToBytes(iv);
    var pinKeyBuffer = forge.util.createBuffer(pinKey);
    pinKeyBuffer.putBytes(pinKey);
    pinKey = pinKeyBuffer.getBytes(24);

    var cipher = forge.cipher.createCipher('3DES-CBC', pinKey);
    var clearPINBlockBytes = forge.util.hexToBytes(clearPinBlock);

    cipher.start({
        iv : iv
    });
    cipher.update(forge.util.createBuffer(clearPINBlockBytes));
    cipher.finish();
    var encrypted = cipher.output;
    var encryptedPinBlock = String(encrypted.toHex());
    return encryptedPinBlock.substring(0, 16);

};
SecureManager.generateKey = function() {
    var bytes = forge.random.getBytesSync(16);
    return bytes;
};

SecureManager.isValueSet = function(value) {

    if (value !== null && value !== "" && value !== "undefined") {
        return true;
    } else {
        return false;
    }
};

SecureManager.padRight = function(value, maxLen) {
    var maxLength = parseInt(maxLen);
    var stringValue = String(value);
    if (!SecureManager.isValueSet(stringValue) || stringValue.length >= maxLength) {
        return stringValue;
    }
    var length = stringValue.length;
    var deficitLength = maxLength - length;
    for (var i = 0; i < deficitLength; i++) {
        stringValue += "0";
    }
    return stringValue;
};

SecureManager.padLeft = function(value, maxLen) {
    var maxLength = parseInt(maxLen);
    var stringValue = String(value);
    if (!SecureManager.isValueSet(stringValue) || stringValue.length >= maxLength) {
        return stringValue;
    }
    var length = stringValue.length;
    var deficitLength = maxLength - length;
    for (var i = 0; i < deficitLength; i++) {
        stringValue = "0" + stringValue;
    }
    return stringValue;
};

SecureManager.getMacData = function(app, options) {
    var macData = "";
    if (!SecureManager.isValueSet(app)) {
        return macData;
    }
    if (SecureManager.isValueSet(options.tid)) {
        macData += String(options.tid);
    }

    if (SecureManager.isValueSet(options.cardName)) {
        macData += options.cardName;
    }
    if (SecureManager.isValueSet(options.ttid)) {
        macData += String(options.ttid);
    }

    if (SecureManager.isValueSet(options.amount)) {
        macData += String(options.amount);
    }

    if (!SecureManager.isValueSet(options.additionalInfo)) {
        return macData;
    }

    if (SecureManager.isValueSet(options.additionalInfo.transferInfo)) {
        if (SecureManager.isValueSet(options.additionalInfo.transferInfo.toAccountNumber)) {
            macData += options.additionalInfo.transferInfo.toAccountNumber;
        }

        if (SecureManager.isValueSet(options.additionalInfo.transferInfo.toBankCode)) {
            macData += options.additionalInfo.transferInfo.toBankCode;
        }
    }

    if (SecureManager.isValueSet(options.additionalInfo.billInfo)) {
        if (SecureManager.isValueSet(options.additionalInfo.billInfo.phoneNumber)) {
            macData += options.additionalInfo.billInfo.phoneNumber;
        }
        if (SecureManager.isValueSet(options.additionalInfo.billInfo.customerNumber)) {
            macData += options.additionalInfo.billInfo.customerNumber;
        }

        if (SecureManager.isValueSet(options.additionalInfo.billInfo.billCode)) {
            macData += options.additionalInfo.billInfo.billCode;
        }

    }

    if (SecureManager.isValueSet(options.additionalInfo.rechargeInfo)) {
        if (SecureManager.isValueSet(options.additionalInfo.rechargeInfo.tPhoneNumber)) {
            macData += options.additionalInfo.rechargeInfo.tPhoneNumber;
        }
        if (SecureManager.isValueSet(options.additionalInfo.rechargeInfo.productionCode)) {
            macData += options.additionalInfo.rechargeInfo.productionCode;
        }

    }

    if (SecureManager.isValueSet(options.additionalInfo.atmTransferInfo)) {
        if (SecureManager.isValueSet(options.additionalInfo.atmTransferInfo.customerId)) {
            var custId = String(options.additionalInfo.atmTransferInfo.customerId);
            macData += custId;
        }
        if (SecureManager.isValueSet(options.additionalInfo.atmTransferInfo.institutionCode)) {
            macData += options.additionalInfo.atmTransferInfo.institutionCode;
        }

    }
    return macData;
};

SecureManager.strToBytes = function(str) {
    var bytes = [];
    var charCode;

    for (var i = 0; i < str.length; ++i) {
        charCode = str.charCodeAt(i);
        bytes.push((charCode & 0xFF00) >> 8);
        bytes.push(charCode & 0xFF);
    }
    return bytes;

};
SecureManager.getMac = function(macData, macKey) {
    //do hmac here
    var hmac = forge.hmac.create();
    hmac.start('sha256', macKey);
    hmac.update(macData);
    return hmac.digest().toHex();
};

SecureManager.authData2 = function(options) {
    //TODO Temporary Activate eCash

    var authString = "1Z"+options.card + 'Z' + options.pin + 'Z' + options.exp + 'Z' + options.cvv;
    console.log("Auth-string: "+authString);
    var vv = SecureManager.toHex(authString);
    //var vv = SecureManager.toHex(options.authData);
    console.log("vv: "+vv);
    var authDataBytes = forge.util.hexToBytes(vv);
    var clearSecureBytes = forge.util.createBuffer();

    var rsa = forge.pki.rsa;
    var modulos = new forge.jsbn.BigInteger(options.publicKeyModulus, 16);
    var exp = new forge.jsbn.BigInteger(options.publicKeyExponent, 16);
    var publicKey = rsa.setPublicKey(modulos, exp);

    var pexp = new forge.jsbn.BigInteger('4913cc0183c7a4a74b5405db55a15db8942f38c8cd7974b3644f6b625d22451e917345baa9750be9f8d10da47dbb45e602c86a6aa8bc1e7f7959561dbaaf35e78a8391009c8d86ee11da206f1ca190491bd765f04953765a2e55010d776044cb2716aee6b6f2f1dc38fce7ab0f4eafec8903a73555b4cf74de1a6bfc7f6a39a869838e3678dcbb96709068358621abf988e8049d5c07d128c5803e9502c05c3e38f94658480621a3e1c75fb4e39773e6eec50f5ef62958df864874ef0b00a0fb86f8382d1657381bc3c283567927f1f68d60205fd7ca1197265dd85c173badc1a15044f782602a9e14adc56728929c646c24fe8e10d26afc733158841d9ed4d1', 16);
    var privateKey = rsa.setPrivateKey(modulos, pexp);

    clearSecureBytes.putBytes(authDataBytes);
    var vvvv = clearSecureBytes.getBytes();

    // console.log("Clear secure: "+forge.util.bytesToHex(vvvv));

    var authBytes = publicKey.encrypt(vvvv);
    var auth = forge.util.encode64(authBytes);
    console.log("Auth-hex: "+auth);

    //var dauth = privateKey.decrypt(auth, 'RSAES-PKCS1-V1_5');
    //console.log("dauth-hex: "+dauth);

    return auth;

};

SecureManager.getSecure = function(options, app, isActivate) {
    //TODO Temporary Activate eCash
    var version = "12";
    version = (isActivate) ? "10" : version;

    var headerBytes = forge.util.hexToBytes("4D");
    var formatVersionBytes = forge.util.hexToBytes(version);
    var macVersionBytes = forge.util.hexToBytes(version);
    var pinDesKey = options.pinKey;
    var macDesKey = options.macKey;
    var customerIdBytes;
    var otherBytes;

    if (SecureManager.isValueSet(options.pan)) {
        var customerId = String(options.pan);
        var customerIdLen = String(customerId.length);
        var customerIdLenLen = customerIdLen.length;
        var customerIdBlock = String(customerIdLenLen) + customerIdLen + customerId;
        var customerIdBlockLen = customerIdBlock.length;
        var pandiff = 40 - parseInt(customerIdBlockLen);
        for (var i = 0; i < pandiff; i++) {
            customerIdBlock += "F";
        }
        customerIdBytes = forge.util.hexToBytes(SecureManager.padRight(customerIdBlock, 40));
        // console.log(forge.util.bytesToHex(customerIdBytes));

    }
    // console.log(pinDesKey);
    // console.log(forge.util.bytesToHex(headerBytes));
    // console.log(forge.util.bytesToHex(pinDesKey));
    // console.log(forge.util.bytesToHex(formatVersionBytes));
    // console.log(forge.util.bytesToHex(macVersionBytes));
    var otherString = "00000000";
    otherBytes = forge.util.hexToBytes(otherString);

    var macData = SecureManager.getMacData(app, options);
    // console.log("MacData : " + macData);
    var mac = SecureManager.getMac(macData, macDesKey);
    var macBytes = forge.util.hexToBytes(mac);
    // console.log("machex : "+mac);
    var footerBytes = forge.util.hexToBytes("5A");

    var clearSecureBytes = forge.util.createBuffer();

    clearSecureBytes.putBytes(headerBytes);
    // console.log("Headerbytes-lenght : "+headerBytes.length);
    clearSecureBytes.putBytes(formatVersionBytes);
    // console.log("formatVersionBytes-lenght : "+formatVersionBytes.length);
    clearSecureBytes.putBytes(macVersionBytes);
    // console.log("macVersionBytes-lenght : "+macVersionBytes.length);
    clearSecureBytes.putBytes(pinDesKey);
    // console.log("pinDesKey-lenght : "+pinDesKey.length);
    clearSecureBytes.putBytes(macDesKey);
    // console.log("macDesKey-lenght : "+macDesKey.length);
    clearSecureBytes.putBytes(customerIdBytes);
    macBytes = forge.util.hexToBytes("00000000");
    // console.log("customerIdBytes-lenght : "+customerIdBytes.length);
    clearSecureBytes.putBytes(macBytes);
    // console.log("macBytes-lenght : "+macBytes.length);

    clearSecureBytes.putBytes(otherBytes);
    // console.log("otherBytes-lenght : "+otherBytes.length);
    clearSecureBytes.putBytes(footerBytes);
    // console.log("footerBytes-lenght : "+footerBytes.length);
    var rsa = forge.pki.rsa;
    var modulos = new forge.jsbn.BigInteger(SECURE_CONFIG.PUBLIC_KEY_MODULES, 16);
    var exp = new forge.jsbn.BigInteger(SECURE_CONFIG.PUBLIC_KEY_EXPONENTS, 16);
    var publicKey = rsa.setPublicKey(modulos, exp);

    var vvvv = clearSecureBytes.getBytes();

    // console.log("Clear secure: "+forge.util.bytesToHex(vvvv));

    var secureBytes = publicKey.encrypt(vvvv, null);
    var secureHex = forge.util.bytesToHex(secureBytes);
    // console.log("Secure-hex: "+secureHex);

    return secureHex;
};

SecureManager.generateSecureData2 = function(options, pinData){
    var pinBlock, expiry, ttId, pinKey, secureOptions, secure, secureData;
    expiry = options.expiry || '0000';
    options.pan = !options.pan || options.pan.replace(/\s/g, '');
    ttId = Math.floor(Randomize() * 900) + 100;
    pinKey = SecureManager.generateKey();
    secureOptions = {
          pinKey: pinKey,
          macKey: pinKey,
          tid: options.mobile,
          ttid: ttId.toString(),
          amount: options.amount,
          pan: options.pan,
          accountNumber: "",
          expiryDate: expiry,
          cardName: "default",
          publicKeyModulus:options.publicKeyModulus,
          publicKeyExponent:options.publicKeyExponent,
          additionalInfo: {
              transferInfo: {
                  toAccountNumber: "",
                  toBankCode: ""
              },
              rechargeInfo: {
                  tPhoneNumber: "",
                  productionCode: ""
              },
              billInfo: {
                  phoneNumber: "",
                  customerNumber: "",
                  billCode: ""
              },
              atmTransferInfo: {
                  customerId: "",
                  transferCode: "",
                  institutionCode: ""
              }
          }
      };

      secureData = SecureManager.getSecure(secureOptions, 'createcard');
      pinBlock = SecureManager.getPinBlock2(pinData.pin, pinData.cvv, pinData.expiry, pinKey, ttId)
      return {secureData,pinBlock };
}
SecureManager.toHex = function(str){

    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;

};

SecureManager.getPinBlock2 = function(pin, cvv2, expiryDate, pinKey, randNum) {
    if (!pin) {
        pin = "0000";
    }
    if (!cvv2) {
        cvv2 = "000";
    }
    if (!expiryDate) {
        expiryDate = "0000";
    }

    var pinBlockString = pin + cvv2 + expiryDate;
    var pinBlockStringLen = pinBlockString.length;
    var pinBlockStringLenLen = String(pinBlockStringLen).length;
    var clearPinBlock = String(pinBlockStringLenLen) + String(pinBlockStringLen) + pinBlockString;

    var randomNumber = randNum;

    var pinpadlen = 16 - clearPinBlock.length;
    for (var i = 0; i < pinpadlen; i++) {
        clearPinBlock = clearPinBlock + randomNumber;
    }

    var iv = 0x00;
    iv = forge.util.hexToBytes(iv);
    var pinKeyBuffer = forge.util.createBuffer(pinKey);
    pinKeyBuffer.putBytes(pinKey);
    pinKey = pinKeyBuffer.getBytes(24);

    var cipher = forge.cipher.createCipher('3DES-CBC', pinKey);
    var clearPINBlockBytes = forge.util.hexToBytes(clearPinBlock);

    cipher.start({
        iv : iv
    });
    cipher.update(forge.util.createBuffer(clearPINBlockBytes));
    cipher.finish();
    var encrypted = cipher.output;
    var encryptedPinBlock = String(encrypted.toHex());
    return encryptedPinBlock.substring(0, 16);

};

export const getPinBlock = (pin, cvv, expiry, pinKey, ttId) => {
    let pinBlock;
    pin = pin || 'FFFF';
    cvv = cvv || 'FFF';
    expiry = expiry || '0000'
    return pinBlock = SecureManager.getPinBlock(pin, cvv, expiry, pinKey, ttId);
}

export const generateSecureData = (options, pinData) => {
    let pinBlock, expiry, pinKey, secureOptions, secure, secureData, macData;
    expiry = options.expiry || '0000';
    options.pan = !options.pan || options.pan.replace(/\s/g, '');
    pinKey = SecureManager.generateKey();
    secureOptions = {
          pinKey: pinKey,
          macKey: pinKey,
          publicKeyModulus: SECURE_CONFIG.PUBLIC_KEY_MODULES,
          publicKeyExponent: SECURE_CONFIG.PUBLIC_KEY_EXPONENTS,
          tid: options.mobile,
          ttid: options.ttid,
          amount: "",
          pan: "0000000000000000",
          accountNumber: "",
          expiryDate: '',
          cardName: "default",
          additionalInfo: {
              transferInfo: {
                  toAccountNumber: "",
                  toBankCode: ""
              },
              rechargeInfo: {
                  tPhoneNumber: "",
                  productionCode: ""
              },
              billInfo: {
                  phoneNumber: "",
                  customerNumber: "",
                  billCode: ""
              },
              atmTransferInfo: {
                  customerId: "",
                  transferCode: "",
                  institutionCode: ""
              }
          }
      };

      console.log(secureOptions);


      secureData = SecureManager.getSecure(secureOptions, 'createcard');
      macData = SecureManager.getMacData('app', secureOptions);
      pinBlock = getPinBlock(pinData.pin, pinData.cvv, pinData.expiry, pinKey, options.ttid)
      return {secureData,pinBlock, macData: SecureManager.getMac(macData, pinKey) };
};


export const generateKey = () => {
    SecureManager.generateKey();
}


export default SecureManager;
