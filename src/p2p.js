const WebSockets = require('ws');

const sockets = [];

// server : Express HTTP server
const startP2PServer = (server) => {
    const wsSercer = new WebSockets.Server({ server });
    wsSercer.on('connection', ws => {
        console.log(`hello ${ws}`);
    });
    console.log('Lupincoin p2p server running');
}


module.exports = {
    startP2PServer
}