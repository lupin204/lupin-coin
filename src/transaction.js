const CryptoJS = require('crypto-js'),
    EC = require('elliptic').ec,
    utils = require('./utils');


// init EC - ECDSA (Elliptic Curve Digital Signature Algorithm) - ECC를 이용한 signature
const ec = new EC('secp256k1');

/*
Transaction_Output
amount = how many coins have they.
address = where they belong to.
*/
class TxOut {
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
    }
}

/*
Transaction_Input (Unspent Transaction Output)
uTxOutId = unspent transaction output ID -> a hash of content - for evaluating transaction.
uxOutIndex -> just for finding transaction. 1, 2, 3, ...
signature
*/
class TxIn {
    // uTxOutId = unspent transaction output ID
    // uTxOutIndex
    // Signature
}

/*
ID
txIn array
txOut array
*/
class Transaction {
    // ID
    // txIn[]
    // txOut[]
}

class UTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

let uTxOuts =[];



// id = txIn array + txOut array => make hash
/*
[25,40,13].reduce((a,b) => a+b) = 25+40+13 = 78
[25,40,13].reduce((a,b) => a+b, "") = "254013"    // reduce(callbackFn, initialValue_첫번째_인수로_사용되는_값)
*/
const getTxId = (tx) => {
    const txInsContent = tx.txIns
        .map(txIn => txIn.uTxOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, "");

    const txOutContent = tx.txOuts
        .map(txOut => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, "");
    return CryptoJS.SHA256(txInsContent + txOutContent).toString();
}

const findUTxOut = (txOutId, txOutIndex, uTxOutList) => {
    return uTxOutList.find(uTxOut => uTxOut.txOutId === txOutId && uTxOut.txOutIndex === txOutIndex);
}

const signTxIn = (tx, txInIndex, privateKey, uTxOut) => {
    const txIn = tx.txIns[txInIndex];
    const dataToSign = tx.id;
    // referenced unspent transaction output - in the unspent transaction output arrays
    const referencedUTxOut = findUTxOut(txIn.txOutId, txIn.txOutIndex, uTxOuts);
    //쓸 돈이 없는 경우
    if (referencedUTxOut === null) {
        return;
    }

    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature = utils.toHexString(key.sign(dataToSign).toDER());
    return signature;
}

const updateUTxOuts = (newTxs, uTxOutList) => {
    const newTxOuts = newTxs.map(tx => {
        tx.txOuts.map((txOut, index) => {
            new UTxOut(tx.id, index, txOut.address, txOut.amount);
        })
    })
    .reduce((a, b) => a.contact(b), []);

    const spentTxOuts = newTxs.map(tx => tx.txIns)
        .reduce((a, b) => a.contact(b), [])
        .map(txIn => new UTxOut(txIn.txOutId, txIn.txOutIndex, "", 0));
    
}


