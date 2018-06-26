const CryptoJS = require('crypto-js');

class TxOut {
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
    }
}

// 이전 트랜잭션에서 사용되지 않은 아웃풋
/*
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
    constructor(uTxOutId, uTxOutIndex, address, amount) {
        this.uTxOutId = uTxOutId
        this.uTxOutIndex = uTxOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

let uTxOuts =[];



// id = txIn array + txOut array => make hash
const getTxId = (tx) => {
    const txInsContent = tx.txIns
        .map(txIn => txIn.uTxOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, "");

    const txOutContent = tx.txOuts
        .map(txOut => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, "");
    return CryptoJS.SHA256(txInsContent + txOutContent).toString();
}

