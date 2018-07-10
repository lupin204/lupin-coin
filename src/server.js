const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    Blockchain = require('./blockchain'),
    P2P = require('./p2p'),
    Wallet = require('./wallet');

const { getBlockchain, createNewBlock, getAccountBalance } = Blockchain;
const { startP2PServer, connectToPeers } = P2P;
const { initWallet } = Wallet;

const PORT = process.env.HTTP_PORT || 3000;

const app = express(); 
app.use(bodyParser.json());
app.use(morgan("combined"));


/*
{
  "index": 1,
  "hash": "9e1355ecd6e09dba8a69d0f29324df956f7dadedb6c451f74784faf42e088c4c",
  "previousHash": "AEEBAD4A796FCC2E15DC4C6061B45ED9B373F26ADFC798CA7D2D8CC58182718E",
  "timestamp": 1531189893,
  "data": [
    {
      "txIns": [
        {
          "signature": "",
          "txOutId": 1
        }
      ],
      "txOuts": [
        {
          "address": "04201fc2c89b5cf914008e33cf0428ee8dfdcba10eed380fc939a85526360f60961ce3297159355f4949eec5a72a010539cbd490be0693f339769a1cbe1eb0cebf",
          "amount": 50
        }
      ],
      "id": "c56a58413317c6738508142f317ecacfe19e4f47fefd1d53adaa5bcf90bbe9f0"
    }
  ],
  "difficulty": 0,
  "nonce": 0
}
*/
app.route("/blocks")
    .get((req, res) => {
        res.send(getBlockchain());
    })
    .post((req, res) => {
        const newBlock = createNewBlock();
        res.send(newBlock);
    });

app.post('/peers', (req, res) => {
    const { body: { peer } } = req;
    connectToPeers(peer);
    res.send();
});

app.get("/me/balance", (req, res) => {
    const balance = getAccountBalance();
    res.send({ balance });
});

const server = app.listen(PORT, () => 
    console.log(`LupinCoin Server running on ${PORT}`)
);

initWallet();
startP2PServer(server);
