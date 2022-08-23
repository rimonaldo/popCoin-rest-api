const SHA2556 = require("crypto-js/sha256");

const EC = require('elliptic').ec
const ec = new EC('secp256k1')


class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash(){
    return SHA2556(this.fromAddress + this.toAddress + this.amount).toString()
  }

  signTransaction(signinKey){
    if(signinKey.getPublic('hex')!== this.fromAddress){
      throw new Error('You cannot sign transactions for other wallets!!')
    }

    const hashTx = this.calculateHash()
    const sig = signinKey.sign(hashTx, 'base64')
    this.signature = sig.toDER('hex')
  }

  isValid(){
    if(this.fromAddress === null ) return true

    const publicKey = ec.keyFromPublic(this.fromAddress,'hex')
    return publicKey.verify(this.calculateHash(),this.signature)
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA2556(
      this.index +
        this.timestamp +
        this.previousHash +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("mining block", this.hash);
  }

  hasValidTransactions(){
    for (const tx of this.transactions){
      if(!tx.isValid()){
        return false
      }
    }
    return true
  }
  
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(Date.now(), "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("block successfully mined");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  addTransaction(transaction){

    if(!transaction.fromAddress || !transaction.toAddress){
      throw new Error('Transaction must include from and to address')
    }
    
    if(!transaction.isValid()){
      throw new Error('Cannot add invalid transaction to chain')
    }

   this.pendingTransactions.push(transaction)
  }

  getBalanceOfAddress(address){
   let balance = 0

   for (const block of this.chain){
      for(const trans of block.transactions){
         if(trans.fromAddress === address){
            balance -= trans.amount
         }

         if(trans.toAddress === address){
            balance += trans.amount
         }
      }
   }

   return balance
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if(!currentBlock.hasValidTransactions()){
        return false
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
        
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      for (let j = 0; j < this.difficulty; j++) {
        if (currentBlock.hash.charAt(j) !== "0") {
          return false;
        }
      }
    }

    return true;
  }
}

module.exports.Blockchain = Blockchain
module.exports.Transaction = Transaction