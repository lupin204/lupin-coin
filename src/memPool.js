const _ = require("lodash"),
    Transactions = require("./transactions");


const { validateTx } = Transactions;

let memPool = [];


const getTxInsInPool = (memPool) => {
    return _(memPool).map(tx => tx.txIns).flatten().value();
}

// 트랜잭션이 이미 mempool에서 사용된 인풋이 있는지 체크 - double spending 체크
const isTxValidForPool = (tx, memPool) => {

    // 일단 mempool에서 모든 인풋을 가져온다.
    const txInsInPool = getTxInsInPool(memPool);
    
    // txIns(모든인풋)에서 찾으려는 동일한 인풋(txIn)이 존재하는지 확인
    // 동일한 인풋 체크는 txOutIndex와 txOutId가 같은지로 체크
    const isTxInAlreadyInPool = (txIns, txIn) => {
        return _.find(txIns, (txInInPool) => {
            return (
                txIn.txOutIndex === txInInPool.txOutIndex && txIn.txOutId === txInInPool.txOutId
            );
        });
    }

    // memPool의 트랜잭션 인풋 리스트에서 트랜잭션_인풋을 하나씩 뒤져보면서 각각의 인풋에 대하여 전부 double spending(중복사용) 체크
    for (const txIn of tx.txIns) {
        
        if (isTxInAlreadyInPool(txInsInPool, txIn)) {
            return false;
        } else {
            return true;
        }
    }

}
