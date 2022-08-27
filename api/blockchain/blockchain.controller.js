const logger = require("../../services/logger.service");
const blockchainService = require("./blockchain.service");
const { Transaction, Blockchain , Block } = require("../../src/blockchain");
const EC = require("elliptic").ec;

let popCoin = new Blockchain();

module.exports = {
  addTransaction,
  getWallet,
  postWallet,
  postBlockchain,
  minePending,
};

// ADD TX
async function addTransaction(req, res) {
  const ec = new EC("secp256k1");
  try {
    const {privateKey,walletAddress, toAddress, amount} = req.body;
    // DATA BINDING
    let popCoinData = await blockchainService.getBlockchainData('popCoin')
    popCoin = blockchainService.setCoinData(popCoinData)
    // 1. SIGNATURE
    const keyPair = ec.keyFromPrivate(privateKey);
    const tx1 = new Transaction(walletAddress, toAddress || "some public key", amount || 10);
    tx1.signTransaction(keyPair);
    // 2. ADD TO PENDING
    popCoin.addTransaction(tx1);

    popCoin = await blockchainService.updateBlockchainData(popCoinData)
    res.send(popCoin)
  } catch (error) {
    logger.error("Could not transfer coins", error);
    res.status(401).send({ error: "Could not transfer coins" });
  }
}

// MINE
async function minePending(req,res){
  try {
    console.log(req.body);
    res.send('mining')
  } catch (error) {
    logger.error("Could not transfer coins", error);
    res.status(401).send({ error: "Could not transfer coins" });
  }
}




async function _getBlockchain(req, res) {
  try {
    const privateKey = req.body.privateKey;
    const walletAddress = await blockchainService.getWalletAddress(privateKey);
    console.log("wallet is", walletAddress);
    const wallet = await blockchainService.getByAddress(walletAddress);
    res.send(wallet);
  } catch (error) {
    logger.error("Invalid key", err);
    res.status(401).send({ err: "Invalid key" });
  }
}

async function getWallet(req, res) {
  try {
    const privateKey = req.body.privateKey;
    const walletAddress = await blockchainService.getWalletAddress(privateKey);
    console.log("wallet is", walletAddress);
    const wallet = await blockchainService.getByAddress(walletAddress);
    res.send(wallet);
  } catch (error) {
    logger.error("Invalid key", err);
    res.status(401).send({ err: "Invalid key" });
  }
}

async function postWallet(req, res) {
  try {
    const privateKey = req.body.privateKey;
    const walletAddress = await blockchainService.getWalletAddress(privateKey);
    const wallet = await blockchainService.addWallet(walletAddress);
    if (!wallet) return res.send(500);
    res.send(walletAddress);
  } catch (error) {
    logger.error("Could not add wallet", error);
    res.status(401).send({ err: "Could not add wallet" });
  }
}

async function postBlockchain(req, res) {
  try {
    let popCoin = await blockchainService.addBlockchain("popCoin");
    if (!popCoin) res.send(popCoin);
    res.send(popCoin);
  } catch (error) {
    logger.error("Could not add blockchain", error);
    res.status(401).send({ err: "Could not add blockchain" });
  }
}


//   TRANSACTION STEPS
// -----------------------------------------------------------------------
// 1. user signs on a transaction
// - 

// 2. transaction goes to a "pool" of pending transactions 

// 3. miners select transactions and form them into a "block" by veryfing:
// - sender has suficcient funds according the blockchain history

// 4. when block is reached its size limit,
// - the miner needs to solve a math puzzle (Pow)
// - hard to solve
// - once solved, hash it into a public string data

// 5. other miners verify the block legitimacy by 
// - taking the public string of data and hashing it 
// - easy to verify

// 6. numbers of blocks that added after this blocks is the 
// - confirmation number (f.e - 5 blocks confirmation)

