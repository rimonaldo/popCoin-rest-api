const dbService = require("../../services/db.service");
const logger = require("../../services/logger.service");
const { Blockchain ,Block} = require("../../src/blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.SECRET1 || "Secret-Puk-1234");

module.exports = {
  getWalletAddress,
  getBlockchainData,
  isPowValid,
  getPow,
  updateBlockchainData,
  isChainValid,
  setCoinData
};
_createBlockchainData('popCoin')


function setCoinData(data){
  const {pendingTransactions,blocks,name,_id} = data 
  let popCoin = new Blockchain
  popCoin.blocks = blocks
  popCoin.pendingTransactions = pendingTransactions
  popCoin.name = name
  popCoin._id = _id
  return popCoin
}

async function updateBlockchainData(blockchain) {
  try {
    const { _id } = blockchain;
    const collection = await dbService.getCollection("blockchain");
    await collection.updateOne({ _id }, { $set: blockchain });
    return blockchain;
  } catch (err) {
    logger.error(`cannot update blockchain ${_id}`, err);
    throw err;
  }
}

async function getBlockchainData(name) {
  try {
    const collection = await dbService.getCollection("blockchain");
    const blockchain = await collection.findOne({ name });
    return blockchain;
  } catch (err) {
    logger.error(`while finding blockchaiin by name: ${address}`, err);
    throw err;
  }
}

async function getWalletAddress(privateKey) {
  const myKey = ec.keyFromPrivate(privateKey);
  return myKey.getPublic("hex");
}

// VALIDATION
async function isChainValid(req,res){
  try {
    let popCoin = new Blockchain
    let popCoinData = await getBlockchainData('popCoin')
    let {blocks,_id, pendingTransactions,prevHash,hash} = popCoinData
   blocks.map(block=>{
    block = new Block(Date.now(), block.transactions, block.prevHash,block.hash)
   })
    popCoin.blocks = blocks
    return popCoin.isChainValid()
  } catch (error) {
    logger.error("Could not validate chain", error);
   throw error
  }
}

async function validatePow(blockHash){
  const pow = await getPow(blockHash)
  return await isPowValid(pow)
}
async function getPow(blockHash) {
  return cryptr.encrypt(JSON.stringify(blockHash)) 
}
async function isPowValid(pow) {
  return JSON.parse(cryptr.decrypt(pow)).substring(0, 4) === "0000";
}

async function _createBlockchainData(name) {
  const blockchainData = getBlockchainData('popCoin')
  if(blockchainData) return
  try {
    const popCoin = new Blockchain();
    const { blocks,pendingTransactions } = popCoin;
    let blockchainToAdd = popCoin;
    const collection = await dbService.getCollection("blockchain");
    blockchainToAdd = {
      name,
      blocks,
      pendingTransactions,
    };
    await collection.insertOne(blockchainToAdd);
    return blockchainToAdd;
  } catch (err) {
    logger.error("cannot add blockchain", err);
    throw err;
  }
}

// async function genPopBlocks(blocks){
//   const popBlocks = []
//   blocks.forEach(block => {
//     let popBlock = new Block
//     popBlock.transactions = block.transactions
//     popBlocks.push(popBlock)
//   })
//   return popBlocks
// }

// async function addWallet(address) {
//   try {
//     const walletToAdd = { address, balance: 0, transactions: [], credit: 50 };
//     const collection = await dbService.getCollection("wallet");

//     const walletExist = await getWalletByAddress(address);
//     if (walletExist) return Promise.reject("Wallet already exists");

//     await collection.insertOne(walletToAdd);
//     return walletToAdd;
//   } catch (err) {
//     logger.error("cannot insert user", err);
//     throw err;
//   }
// }

// async function getWalletByAddress(address) {
//   try {
//     const collection = await dbService.getCollection("wallet");
//     const wallet = await collection.findOne({ address });
//     return wallet;
//   } catch (err) {
//     logger.error(`while finding wallet by address: ${address}`, err);
//     throw err;
//   }
// }

// async function getByPrivateKey(privateKey) {
//   try {
//     const collection = await dbService.getCollection("wallet");
//     const wallet = await collection.findOne({ privateKey });
//     return wallet;
//   } catch (err) {
//     logger.error(`while finding wallet by privateKey: ${privateKey}`, err);
//     throw err;
//   }
// }




