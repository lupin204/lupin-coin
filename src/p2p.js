const WebSockets = require('ws');
    Blockchain = require('./blockchain');


const { getNewestBlock, isBlockStructureValid } = Blockchain;

const sockets = [];

// Messages Types ( REDUX )
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RESPONSE = "BLOCKCHAIN_RESPONSE";

// Messages Creators ( REDUX - reducer )
const getLatest = () => {
    return {
        type: GET_LATEST,
        data: null
    };
};
const getAll = () => {
    return {
        type: GET_ALL,
        data: null
    };
};
const blockchainResponse = (data) => {
    return {
        type: BLOCKCHAIN_RESPONSE,
        data: data
    };
};

// server : Express HTTP server
const startP2PServer = (server) => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on('connection', ws => {
        console.log(`hello Sockets!`);
        initSocketConnection(ws);
    });
    console.log('Lupincoin p2p server running');
}

// 새로운 소켓이 HTTP웹서버에 접속할때마다 호출
const initSocketConnection = (ws) => {
    sockets.push(ws);
    handleSocketMessages(ws);
    handleSocketError(ws);
    sendMessage(ws, getLatest());
}

const parseData = (data) => {
    try {
        return JSON.parse(data);
    } catch(e) {
        console.log(e);
        return null;
    }
}

const handleSocketMessages = (ws) => {
    ws.on('message', (data) => {
        const message = parseData(data);
        if (message === null) {
            return;     // just exit this function
        }
        console.log(message);
        switch(message.type) {
            case GET_LATEST:
                sendMessage(ws, responseLatest());
                //sendMessage(ws, getNewestBlock());
                break;
            case BLOCKCHAIN_RESPONSE:
                const receivedBlocks = message.data;
                if (receivedBlocks === null) {
                    break;
                }
                handleBlockchainResponse(receivedBlocks);
                break;
        }
    });
}

const handleBlockchainResponse = (receivedBlocks) => {
    if (receivedBlocks.length === 0) {
        console.log('Received blocks have a length of 0');
        return;
    }
    const latestBlockReceived = receivedBlocks[receivedBlocks.length -1];
    if (!isBlockStructureValid(latestBlockReceived)) {
        console.log('The block structure of the block received is not valid');
        return;
    }
    // peer(상대방)에서 받은 블록체인이 내가 가진 블록체인보다 크다면(앞선다면, 새것이라면) peer의 블록체인으로 교체
    const newestBlock = getNewestBlock();
    if (latestBlockReceived.index > newestBlock.index) {
        // 상대방이 나보다 1만큼 앞선다면 내꺼에 하나 추가하여 싱크
        if (newEstBlock.hash === latestBlockReceived.previousHash) {
            addBlockToChain(latestBlockReceived);
        // 상대방이 나보다 2이상 앞선다면(previousHash로 비교가 불가하면) 블록 전체를 가져옴
        } else if (receivedBlocks.length === 1) {

        // 2이상 앞서면서, 이미 여러개 가지고있으면 블록체인을 교체
        } else {
            replaceChain(receivedBlocks);
        }
    }
}

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

const responseLatest = () => blockchainResponse([getNewestBlock()]);

const handleSocketError = (ws) => {
    const closeSocketConnection = (ws) => {
        ws.close();
        sockets.splice(sockets.indexOf(ws, 1));
    }
    ws.on('close', () => closeSocketConnection(ws));
    ws.on('error', () => closeSocketConnection(ws));
}

const connectToPeers = newPeer => {
    const ws = new WebSockets(newPeer);
    ws.on('open', () => {
        initSocketConnection(ws);
    });
}

module.exports = {
    startP2PServer,
    connectToPeers
}


/*
flow chart: create p2p server
    startP2PServer(WebSocket서버 생성)
flow chart:
    POST '/peers'
        connectToPeers
*/
