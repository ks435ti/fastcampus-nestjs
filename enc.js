const CryptoJS = require('crypto-js');

// Function to encrypt data
function encryptData(plainData, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(plainData, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

// Encryption key and IV (use environment variables for security)
const key = '8264754987545454'; // Replace with your key
const iv = '764851343443456184';   // Replace with your IV

// Raw request body
const requestBody = {
    "CustCode": "H0000972"
};

// Encrypt the request payload
const encryptedPayload = encryptData(JSON.stringify(requestBody), key, iv);

// Prepare the final payload to include the encrypted content and IV
const finalPayload = {
    content: encryptedPayload,
    iv: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(iv)),
};

// Set the encrypted payload as the request body
// pm.request.body.raw = JSON.stringify(finalPayload);

// Log the encrypted payload for debugging
console.log('Encrypted Payload:', finalPayload);