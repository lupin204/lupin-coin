const CryptoJS = require("crypto-js"),
    Wallet = require("./wallet"),
    Transactions = require("./transactions"),
    hexToBinary = require("hex-to-binary");

const { getBalance, getPublicFromWallet,  } = Wallet;
const { createCoinbaseTx } = Transactions;

const BLOCK_GENERATION_INTERVAL = 10;   // 매 10초마다 코인 채굴 (bitcoin = every 10*60 seconds)
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;  // 매 10개 블록이 채굴될때마다 난이도 조정 (bitcoin = every 2016 blocks)

class Block {
    constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

const genesisBlock = new Block(
    0,
    'AEEBAD4A796FCC2E15DC4C6061B45ED9B373F26ADFC798CA7D2D8CC58182718E',
    null,
    1529911829,
    'The Genesis of lupin-coin',
    0,
    0
);

let blockchain = [genesisBlock];

let uTxOuts =[];

const getNewestBlock = () => blockchain[blockchain.length -1];

const getTimestamp = () => Math.round(new Date().getTime() / 1000);

const getBlockchain = () => blockchain;

const createHash = (index, previousHash, timestamp, data, difficulty, nonce) => 
    CryptoJS.SHA256(
        index + previousHash + timestamp + JSON.stringify(data) + difficulty + nonce
    ).toString();

const createNewBlock = () => {
    const coinbaseTx = createCoinbaseTx(
        getPublicFromWallet(), 
        getNewestBlock().index + 1
    );
    const blockData = [coinbaseTx];
    return createNewRawBlock(blockData);
}

const createNewRawBlock = data => {
    const previousBlock = getNewestBlock();
    const newBlockIndex = previousBlock.index + 1;
    const newTimestamp = getTimestamp();
    const difficulty = findDifficulty();

    const newBlock = findBlock(newBlockIndex, previousBlock.hash, newTimestamp, data, difficulty);
    addBlockToChain(newBlock);
    require("./p2p").broadcastNewBlock();
    return newBlock;
}

const findDifficulty = () => {
    const newestBlock = getNewestBlock();
    // calculate new difficulty every 10 blocks (except for 0 index - genesis block)
    if (newestBlock.index % BLOCK_GENERATION_INTERVAL === 0 && newestBlock.index !== 0) {
        return calculateNewDifficulty(newestBlock, getBlockchain());
    } else {
        return newestBlock.difficulty;
    }
}

const calculateNewDifficulty = (newestBlock, blockchain) => {
    const lastCalculatedBlock = blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;    // 10개 채굴 예상시간 = 10초 * 10개 = 100초
    const timeTaken = newestBlock.timestamp - lastCalculatedBlock.timestamp;            // 실제 10개 채굴 시간
    // 실제 채굴시간이 예상(계획)했던 시간 2배이상 짧게 걸리면 난이도 증가, 2배이상 길게 걸리면 난이도 감소
    if (timeTaken < timeExpected/2) {
        return lastCalculatedBlock.difficulty + 1;
    } else if (timeTaken > timeExpected/2) {
        return lastCalculatedBlock.difficulty > 0 ? lastCalculatedBlock.difficulty - 1 : lastCalculatedBlock.difficulty;
    } else {
        return lastCalculatedBlock.difficulty;
    }
}

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
    let nonce = 0;
    // infinite loop
    while (true) {
        console.log('current nonce', nonce);
        const hash = createHash(index, previousHash, timestamp, data, difficulty, nonce);
        // TODO: check amount of zeros (hashMatchesDifficulty)
        if (hasMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        } else {
            nonce++;
        }
    }
}

// hash to binary
const hasMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = hexToBinary(hash);
    const requiredZeros = '0'.repeat(difficulty);   // 'abc'.repeat(4) = 'abcabcabcabc'
    console.log("Trying difficulty:", difficulty, "with hash", hashInBinary);
    return hashInBinary.startsWith(requiredZeros);
}

const getBlocksHash = (block) =>
    createHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

// timestamp 검증 : 현재시간 +- 1분 오차까지 허용.
const isTimestampValid = (newBlock, oldBlock) => {
    return (
        oldBlock.timestamp - 60 < newBlock.timestamp 
        && newBlock.timestamp - 60 < getTimestamp()
    );
}

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
    } else if (getBlocksHash(candidateBlock) !== candidateBlock.hash) {
        console.log('The hash of this block is invalid');
        return false;
    // check this block's timestamp
    } else if (!isTimestampValid(candidateBlock, latestBlock)) {
        console.log('The timestamp of this block is doge');
    }
    return true;
}

// check block structures
// "data" --> 
const isBlockStructureValid = (block) => {
    return (
        typeof block.index === 'number' 
        && typeof block.hash === 'string' 
        && typeof block.previousHash === 'string' 
        && typeof block.timestamp === 'number' 
        && typeof block.data === 'object'
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

// 블록체인의 난이도를 체크
// [4,5,2,4,6,7, ...] -> [4^2, 5^2, 2^2, 4^2, 6^2, 7^2, ...] -> (4^2 + 5^2 + 6^2 + 7^2 + ...) = Number
const sumDifficulty = (anyBlockchain) =>
    anyBlockchain
        .map(block => block.difficulty)
        .map(difficulty => Math.pow(2, difficulty))
        .reduce((a, b) => a + b)

/*
기존 블록체인보다 새로운 블록체인 길이가 더 길면 새것으로 교체 (x)
--> 기존 블록체인보다 새로운 블록체인의 난이도가 더 높으면 새것으로 교체 (o)
새 블록체인을 검증(Genesis block이 같고, 각각의 블록들이 모두 valid)하여 이상없으면..
*/
const replaceChain = candidateChain => {
    if (isChainValid(candidateChain) && sumDifficulty(candidateChain) > sumDifficulty(getBlockchain())) {
        blockchain = candidateChain;
        return true;
    } else {
        return false;
    }
}

const addBlockToChain = candidateBlock => {
    if (isBlockValid(candidateBlock, getNewestBlock())) {
        blockchain.push(candidateBlock);
        return true;
    } else {
        return false;
    }
}

const getAccountBalance = () => getBalance(getPublicFromWallet(), uTxOuts);

module.exports = {
    getNewestBlock,
    getBlockchain,
    createNewBlock,
    isBlockStructureValid,
    addBlockToChain,
    replaceChain,
    getAccountBalance
}