import SecureManager from './secure';
import SECURE_CONFIG from './secure.config'

const Randomize = () => {
  return Math.random() ;
}

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
