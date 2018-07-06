const EC = require('elliptic').ec,
    path = require('path'),
    fs = require('fs');

// init EC - ECDSA (Elliptic Curve Digital Signature Algorithm) - ECC를 이용한 signature
const ec = new EC('secp256k1');

const privateKeyLocation = path.join(__dirname, "privateKey");

const genearatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);     // radix: hexa-decimal(16진수)
}

const initWallet = () => {
    // already have wallet.
    if (fs.existsSync(privateKeyLocation)) {
        return;
    }
    const newPrivateKey = genearatePrivateKey();
    // export privateKey to file.
    fs.writeFileSync(privateKeyLocation, newPrivateKey);
}

module.exports = {
    initWallet
};