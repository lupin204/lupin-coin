const CryptoJS = require("crypto-js");

class Block {
    constructor(index, hash, previousHash, timestamp, data) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
}

const genesisBlock = new Block(
    0,
    'AEEBAD4A796FCC2E15DC4C6061B45ED9B373F26ADFC798CA7D2D8CC58182718E',
    null,
    1529047635358,
    'The Genesis of lupin-coin'
);

let blockchain = [genesisBlock];

const getNewestBlock = () => blockchain[blockchain.length -1];

const getTimestamp = () => new Date().getTime() / 1000;

const getBlockchain = () => blockchain;

const createHash = (index, previousHash, timestamp, data) => 
    CryptoJS.SHA256(
        index + previousHash + timestamp + JSON.stringify(data)
    ).toString();

const createNewBlock = data => {
    const previousBlock = getNewestBlock();
    const newBlockIndex = previousBlock.index + 1;
    const newTimestamp = getTimestamp();
    const newHash = createHash(newBlockIndex, previousBlock.hash, newTimestamp, data);

    const newBlock = new Block(newBlockIndex, newHash, previousBlock.hash, newTimestamp, data);
    addBlockToChain(newBlock);
    return newBlock;
}

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data);

// check block contents (index and hash)
// 새로 push할 block(candidate, new block)과 / 블록체인 배열 제일 마지막 block(latest, previous block)을 검증
const isBlockValid = (candidateBlock, latestBlock) => {
    // check this block's valid structure
    if (!isBlockStructureValid(candidateBlock)) {
        console.log('The Candidate block structure is not valid');
        return false;
    // check sequential index
    } else if (latestBlock.index + 1 !== candidateBlock.index) {
        console.log('The Candidate block doesnt have a valid index');
        return false;
    // check sequential hash
    } else if (latestBlock.hash !== candidateBlock.previousHash) {
        console.log('The previousHash of the candidate block is not the hash of the latest block');
        return false;
    // check this block's hash
    } else if (getBlockHash(candidateBlock) !== candidateBlock.hash) {
        console.log('The hash of this block is invalid');
        return false;
    }
    return true;
}

// check block structures
const isBlockStructureValid = (block) => {
    return (
        typeof block.index === 'number' 
        && typeof block.hash === 'string' 
        && typeof block.previousHash === 'string' 
        && typeof block.timestamp === 'number' 
        && typeof block.data === 'string'
    );
}

/*
서로 이어 붙일 블록체인은 같은 하나의 Genesis 출신이어야 한다
*/
const isChainValid = (candidateChain) => {
    const isGenesisValid = block => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if (!isGenesisValid(candidateChain[0])) {
        console.log("The candidate chain's genesisBlock is not the same as our genesisBlock");
        return false;
    }
    // 2번째(i=1) 블록부터 체크 ( 1번째(i=0) 블록은 genesis block이라 previous hash = null 이기때문에 검증하지 않음 )
    for (let i=1; i<candidateChain.length; i++) {
        if (!isBlockValid(candidateChain[i], candidateChain[i-1])) {
            return false;
        }
    }
    return true;
}

/*
기존 블록체인보다 새로운 블록체인 길이가 더 길면 새것으로 교체
새 블록체인을 검증(Genesis block이 같고, 각각의 블록들이 모두 valid)하여 이상없으면..
*/
const replaceChain = candidateChain => {
    if (isChainValid(candidateChain) && candidateChain.length > getBlockchain().length) {
        blockChain = candidateChain;
        return true;
    } else {
        return false;
    }
}

const addBlockToChain = candidateBlock => {
    if (isBlockValid(candidateBlock, getNewestBlock())) {
        getBlockchain().push(candidateBlock);
        return true;
    } else {
        return false;
    }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

module.exports = {
    getNewestBlock,
    getBlockchain,
    createNewBlock,
    isBlockStructureValid,
    addBlockToChain
}