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
signature -> "my" transaction -> private key  ||  public key = target bitcoin address (보내려는 상대방 비트코인 주소)
*/
class TxIn {
    // uTxOutId = unspent transaction output ID
    // uTxOutIndex
    // Signature
}

/*
ID = hash of TxIns and TxOuts
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
// 트랜잭션 인풋과 아웃풋 각각 배열의 모든 원소를 문자열로 이어붙이고, 이 긴 문자열을 해싱.
/*
reduce(callbackFn, initialValue_첫번째_인수로_사용되는_값)
[25,40,13].reduce((a,b) => a+b) = 25+40+13 = 78
-> {address,amount} => [{'4646',80},{'4646',70},{'3434',50}] => ['464680','464670','343460'].reduce((a,b) => a+b, "") = "464680464670343450"
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

// 트랜잭션 인풋에 사인
// txInput's signature (내 사인(표시) - 보내는사람)
// tx_in's sign <- hash(ECC-ecliptic) <- txID <- hash(SHA256-cryptoJs) <- txIn_arrays + txOuts_array <- previous tx_out + tx_out
const signTxIn = (tx, txInIndex, privateKey, uTxOut) => {
    const txIn = tx.txIns[txInIndex];
    const dataToSign = tx.id;
    // 트랜잭션 인풋을 찾으려면 Unspent tx out 을 찾아야 함. 이 Unspent tx out은 트랜잭션 아웃풋 배열에서 찾을 수 있음. 
    // 왜냐하면 트랜잭션 인풋이 트랜잭션 아웃풋을 참조(레퍼런스)하기 때문. 내가 돈이 남아있음(unspent tx out)을 증명.
    // referenced unspent transaction output - in the unspent transaction output arrays
    const referencedUTxOut = findUTxOut(txIn.txOutId, txIn.txOutIndex, uTxOuts);
    //쓸 돈이 없는 경우
    if (referencedUTxOut === null) {
        return;
    }

    const key = ec.keyFromPrivate(privateKey, 'hex');
    // sign하는 포맷 방식 = EDR포맷
    const signature = utils.toHexString(key.sign(dataToSign).toDER());
    return signature;
}

/*
"U_TX_OUT_LIST" = [A(40), B, C, D, E, F, G]

A(40) --> TRANSACTION --> ZZ(10)
                      --> MM(30)

TRANSACTION에서 A가 사용되었으므로 A는 삭제함.
ZZ와 MM은 새로운 Unspent_Tx_Output(아직 트랜잭션에 사용되지 않은 아웃풋)이니까 맨 뒤에 추가함

"NEW_U_TX_OUT_LIST" = [B, C, D, E, F, G, ZZ, MM]
*/

// 트랜잭션 -> 트랜잭션 아웃풋 -> unspent 트랜잭션 아웃풋 생성
// param - uTxOutList => u_tx_out과 그 주소.
const updateUTxOuts = (newTxs, uTxOutList) => {
    // 트랜잭션 전체를 다 살펴보고, 트랜잭션 아웃풋도 다 뒤져서 새로운 u_tx_out을 생성
    const newTxOuts = newTxs.map(tx => {
        tx.txOuts.map((txOut, index) => {
            new UTxOut(tx.id, index, txOut.address, txOut.amount);
        })
    })
        .reduce((a, b) => a.concat(b), []);

    // 트랜잭션 인풋으로 사용된 모든 트랜잭션 아웃풋을 가져다가 일단 비움.
    // input이 50이고 10을 보내고 싶으면, 일단 input의 50을 지움.
    const spentTxOuts = newTxs.map(tx => tx.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map(txIn => new UTxOut(txIn.txOutId, txIn.txOutIndex, "", 0));
    
    // 리스트의 u_tx_output을 가져다가, 내가 사용한 트랜잭션 아웃풋을 찾아서 삭제(filter)하고, 새로운 u_tx_output을 추가(concat).
    const resultingUTxOuts = uTxOutList
        .filter(uTxO => !findUTxOut(uTxO.txOutId, uTxO.txOutIndex, spentTxOuts))
        .concat(newUTxOuts);
        
    return resultingUTxOuts;
}


//------------------------------
// check validation of tx.
const isTxInStructureValid = (txIn) => {
    if (txIn === null) {
        return false;
    } else if (typeof txIn.signature !== 'string') {
        return false;
    } else if (typeof txIn.txOutId !== 'string') {      // hash
        return false;
    } else if (typeof txIn.txOutIndex !== 'number') {
        return false;
    } else {
        return true;
    }
}
const isTxOutStructureValid = (txOut) => {
    // to-do
    return true;
}
const isTxStructureValid = (tx) => {
    if (typeof tx.id !== 'string') {
        console.log('Tx ID is not valid');
        return false;
    } else if (!(tx.txIns instanceof Array)) {
        console.log('The TxIns are not an array');
        return false;
    } else if (!isTxInStructureValid(tx.txIns)) {
        console.log('The structure of one of the txIn is not valid');
        return false;
    } else if (!(tx.txOuts instanceof Array)) {
        console.log('The TxOuts are not an array');
        return false;
    } else if (!isTxOutStructureValid(tx.txOuts)) {
        console.log('The structure of one of the txOut is not valid');
    } else {
        return true;
    }
}

