const EC = require('elliptic').ec,
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

// init EC - ECDSA (Elliptic Curve Digital Signature Algorithm) - ECC를 이용한 signature
const ec = new EC('secp256k1');

// 파일 위치
const privateKeyLocation = path.join(__dirname, "privateKey");

const genearatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);     // radix: hexa-decimal(16진수)
}

const getPrivateFromWallet = () => {
    const buffer = fs.readFileSync(privateKeyLocation, 'utf-8');
    buffer.toString();
}

const getPublicFromWallet = () => {
    const privateKey = getPrivateFromWallet();
    const key = ec.keyFromPrivate(privateKey, "hex");
    return key.getPublic().encode("hex");
}

// my balance(내가 가진 코인 총 수량) = Unspent Transaction Output Arrays 에서 내 주소와 같은 것만 찾아 amount의 합.
const getBalance = (address, uTxOuts) => {
    // How To Use "lodash"
    // use to lo_([12, 34, 56]).sum() = [12, 34, 56].reduce((a, b) => a + b, 0) = 12+34+56 = 106
    return _(uTxOuts).filter(uTxO => uTxO.address === address).map(uTxO => uTxO.amount).sum();
}



// make "privateKey" file.
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