const userService = require("./popCoin.service");
const socketService = require("../../services/socket.service");
const logger = require("../../services/logger.service");
const { Transaction, Blockchain } = require("../../src/blockchain");
const { getWalletAddress } = require("./popCoin.service");

const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
let popCoin = new Blockchain();

async function sendCoins(req, res) {
    // const privateKey =  
    const privateKey = req.body.privateKey
    const pairKey = ec.keyFromPrivate(privateKey)
    const myWalletAddress = await getWalletAddress(privateKey)


    const tx1 = new Transaction(myWalletAddress,'some public key', 10)
    tx1.signTransaction(pairKey)
    popCoin.addTransaction(tx1)
    
    
    
    console.log('starting the miner');
    popCoin.minePendingTransactions(myWalletAddress)
    
    console.log('balance of rimon is', popCoin.getBalanceOfAddress(myWalletAddress));


    
    res.send('shmanx')
}

async function getWallet(req, res) {
  try {
    const key = req.body.key;
    const walletAddress = await getWalletAddress(key);
    res.send(walletAddress);
  } catch (error) {
    logger.error("Invalid key", err);
    res.status(401).send({ err: "Invalid key" });
  }
}

async function getUser(req, res) {
  try {
    const user = await userServi;
    ce.getById(req.params.id);
    res.send(user);
  } catch (err) {
    logger.error("Failed to get user", err);
    res.status(500).send({ err: "Failed to get user" });
  }
}

async function getUsers(req, res) {
  try {
    const filterBy = {
      txt: req.query?.txt || "",
      minBalance: +req.query?.minBalance || 0,
    };
    const users = await userService.query(filterBy);
    res.send(users);
  } catch (err) {
    logger.error("Failed to get users", err);
    res.status(500).send({ err: "Failed to get users" });
  }
}

async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id);
    res.send({ msg: "Deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete user", err);
    res.status(500).send({ err: "Failed to delete user" });
  }
}

async function updateUser(req, res) {
  try {
    const user = req.body;
    const savedUser = await userService.update(user);
    res.send(savedUser);
  } catch (err) {
    logger.error("Failed to update user", err);
    res.status(500).send({ err: "Failed to update user" });
  }
}

module.exports = {
  sendCoins,
  getWallet,
};
