const _ = require("lodash"),
    Transactions = require("./transactions");


const { validateTx } = Transactions;

let mempool = [];


const getTxInsInPool = (mempool) => {
    return _(mempool).map(tx => tx.txIns).flatten().value();
}

// 트랜잭션이 이미 mempool에서 사용된 인풋이 있는지 체크 - double spending 체크
const isTxValidForPool = (tx, mempool) => {

    // 일단 mempool에서 모든 인풋을 가져온다.
    const txInsInPool = getTxInsInPool(mempool);
    
    // txIns(모든인풋)에서 찾으려는 동일한 인풋(txIn)이 존재하는지 확인
    // 동일한 인풋 체크는 txOutIndex와 txOutId가 같은지로 체크
    const isTxInAlreadyInPool = (txIns, txIn) => {
        return _.find(txIns, (txInInPool) => {
            return (
                txIn.txOutIndex === txInInPool.txOutIndex && txIn.txOutId === txInInPool.txOutId
            );
        });
    }

    // mempool의 트랜잭션 인풋 리스트에서 트랜잭션_인풋을 하나씩 뒤져보면서 각각의 인풋에 대하여 전부 double spending(중복사용) 체크
    for (const txIn of tx.txIns) {
        if (isTxInAlreadyInPool(txInsInPool, txIn)) {
            return false;
        } else {
            return true;
        }
    }

}

const addToMempool = (tx, uTxOutList) => {
    // express서버에 요청 보내고 에러를 리턴하면.
    if (!validateTx(tx, uTxOutList)) {
        throw Error("This tx is invalid. Will not add to pool");
    } else if (!isTxValidForPool(tx, mempool)) {
        throw Error("This tx is not valid for the pool, Will not add it");
    }
    mempool.push(tx);
}

module.exports = {
    addToMempool
}