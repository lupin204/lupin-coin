const EC = require('elliptic').ec,
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    Transactions = require('./transactions');

const { getPublicKey, getTxId, signTxIn, TxIn, Transaction, TxOut } = Transactions;

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

const findAmountInUTxOuts = (amountNeeded, myUTxOuts) => {
    let currentAmount = 0;
    const includedUTxOuts = [];
    for (const myUTxOut of myUTxOuts) {
        includedUTxOuts.push(myUTxOut);
        currentAmount = currentAmount + myUTxOut.amount;
        if (currentAmount >= amountNeeded) {
            const leftOverAmount = currentAmount - amountNeeded;
            return { includedUTxOuts, leftOverAmount };
        }
    }
    console.log("Not enoutgh founds");
    return false;
}

// 아웃풋은 2개 (받는사람(주소), 보내는사람(주소), 보내는 수량, 보내고 남은 수량)
const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
    const receiverTxOut = new TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {     // 보내고 남은 잔액이 0이면..
        return [receiverTxOut];
    } else {
        const leftOverTxOut = new TxOut(myAddress, leftOverAmount);
        return [receiverTxOut, leftOverAmount];
    }

}

// 트랜잭션 생성 : 받을사람 주소, 보낼 수량, 보내는사람 증명(사인), 내가 가진 잔액수량.
// 인풋을 넣고 필요한 수량, 모든 unspent tx output을 살펴보고. 그걸 사인 안한 배열로 일단 만들고. 그다음 트랜잭션_아웃픗을 생성 하고. 마지막으로 privateKey로 사인
const createTx = (receiverAddress, amount, privateKey, uTxOutList) => {
    const myAddress = getPublicKey(privateKey);

    // 내 소유의 unspent tx output list --> 내가 가진 코인 수량
    const myUTxOuts = uTxOutList.filter(uTxO => uTxO.address === myAddress);

    const { includedUTxOuts, leftOverAmount } = findAmountInUTxOuts(amount, myUTxOuts);

    // 트랜잭션_아웃풋(Unspent Tx Output List)을 가지고 트랜잭션_인풋(txOutId + txOutIndex + Signature) 생성
    const toUnsignedTxIns = (uTxOut) => {
        const txIn = new TxIn();
        txIn.txOutId = uTxOut.txOutId;
        txIn.txOutIndex = uTxOut.txOutIndex;
    }

    const unsignedTxIns = includedUTxOuts.map(toUnsignedTxIns);

    const tx = new Transaction();
    tx.txIns = unsignedTxIns;   // 아직 signature 안한 인풋
    tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);   // 인풋으로 아웃풋을 만들어내는 함수
    tx.id = getTxId(tx);

    // 아직 사인 안한거에 사인함.
    tx.txIns = tx.txIns.map((txIn, index) => {
        txIn.signature = signTxIn(tx, index, privateKey, uTxOutList);
        return txIn;
    })
    return tx;
}

module.exports = {
    initWallet

    
};