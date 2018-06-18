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

const genesisBlock = new Block(0, 'AEEBAD4A796FCC2E15DC4C6061B45ED9B373F26ADFC798CA7D2D8CC58182718E', null, 1529047635358, 'The Genesis of lupin-coin');

let blockchain = [genesisBlock];

const getLastBlock = () => blockchain[blockchain.length -1];

const getTimestamp = () => new Date().getTime() / 1000;

const createHash = (index, previousHash, timestamp, data) => 
    CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

const createNewBlock = data => {
    const previousBlock = getLastBlock();
    const newBlockIndex = previousBlock.index + 1;
    const newTimestamp = getTimestamp();
    const newHash = createHash(newBlockIndex, previousBlock.hash, newTimestamp + data);

    const newBlock = new Block(newBlockIndex, newHash, previousBlock.hash, newTimestamp, data);
    return newBlock;
}

const getBlockHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data);

// check block contents (index and hash)
const isNewBlockValid = (candidateBlock, latestBlock) => {
    // check sequential index
    if (latestBlock.index + 1 !== candidateBlock.index) {
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
const isNewStructureValid = (block) => {
    return (
        typeof block.index === 'number' 
        && typeof block.hash === 'string' 
        && typeof block.previousHash === 'string' 
        && typeof block.timestamp === 'number' 
        && typeof block.data === 'string'
    );
}

console.log(blockchain);