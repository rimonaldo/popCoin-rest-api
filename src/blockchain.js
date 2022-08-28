const SHA2556 = require('crypto-js/sha256')

const EC = require('elliptic').ec
const ec = new EC('secp256k1')

//  BLOCKCHAIN
// -------------------------------------------------------------------
class Blockchain {
   constructor() {
      this.blocks = [this.createGenesisBlock()]
      this.difficulty = 4
      this.pendingTransactions = []
      this.miningReward = 10
   }

   createGenesisBlock() {
      return new Block(Date.now(), 'Genesis block', '0')
   }

   getLatestBlock() {
      return this.blocks[this.blocks.length - 1]
   }

   minePendingTransactions(miningRewardAddress) {
      let reward = new Transaction('popCoin', miningRewardAddress, this.miningReward)
      const blockTxs = [this.pendingTransactions, reward]
      this.pendingTransactions.push(reward)
      const prevHash = this.getLatestBlock().hash
      let block = new Block(Date.now(), this.pendingTransactions, prevHash)
      console.log(this.pendingTransactions)
      const blockHash = block.mineBlock(this.difficulty)
      // if(!this.isChainValid()) return false
      this.pendingTransactions = []
      console.log('block successfully mined')
      this.blocks.push(block)

      return blockHash
   }

   addTransaction(transaction, idx) {
      if (!transaction.fromAddress || !transaction.toAddress) {
         throw new Error('Transaction must include from and to address')
      }
      if (!transaction.isValid()) {
         throw new Error('Cannot add invalid transaction to chain')
      }
      transaction.index = idx
      this.pendingTransactions.push(transaction)
      return this.pendingTransactions
   }

   getBalanceOfAddress(address) {
      let balance = 0

      for (const block of this.blocks) {
         for (const trans of block.transactions) {
            if (trans.fromAddress === address) {
               balance -= trans.amount
              }
              if (trans.toAddress === address) {
                balance += trans.amount
              }
            }
          }
      return balance
   }

   isChainValid() {
      for (let i = 1; i < this.blocks.length; i++) {
         const currentBlock = this.blocks[i]
         const previousBlock = this.blocks[i - 1]

         // if (!currentBlock.hasValidTransactions()) {
         //   return false;
         // }

         // if (currentBlock.hash !== currentBlock.calculateHash()) {
         //   return false;
         // }

         if (currentBlock.previousHash !== previousBlock.hash) {
            return false
         }

         for (let j = 0; j < this.difficulty; j++) {
            if (currentBlock.hash.charAt(j) !== '0') {
               return false
            }
         }
      }

      return true
   }
}
//  BLOCK
// -------------------------------------------------------------------
class Block {
   constructor(timestamp, transactions, previousHash = '', hash = '') {
      this.timestamp = timestamp
      this.transactions = transactions
      this.previousHash = previousHash
      this.hash = hash || this.calculateHash()
      this.nonce = 0
   }

   calculateHash() {
      return SHA2556(
         this.index + this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce
      ).toString()
   }

   mineBlock(difficulty) {
      while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
         this.nonce++
         this.hash = this.calculateHash()
      }
      console.log('mining block', this.hash)
      return this.hash
   }

   hasValidTransactions() {
      for (const tx of this.transactions) {
         if (!tx.isValid()) {
            return false
         }
      }
      return true
   }

   addTransaction(transaction) {
      if (!transaction.fromAddress || !transaction.toAddress) {
         throw new Error('Transaction must include from and to address')
      }
      if (!transaction.isValid()) {
         throw new Error('Cannot add invalid transaction to chain')
      }
      this.pendingTransactions.push(transaction)
   }
}

//  TRANSACTION
// -------------------------------------------------------------------
class Transaction {
   constructor(fromAddress, toAddress, amount) {
      this.fromAddress = fromAddress
      this.toAddress = toAddress
      this.amount = amount
      this._id = this._makeId()
   }

   calculateHash(secret = '') {
      return SHA2556(this.fromAddress + this.toAddress + this.amount).toString()
   }

   signTransaction(signinKey, index) {
      if (signinKey.getPublic('hex') !== this.fromAddress) {
         throw new Error('You cannot sign transactions for other wallets!!')
      }
      this.index = index
      const hashTx = this.calculateHash()
      const sig = signinKey.sign(hashTx, 'base64')
      this.signature = sig.toDER('hex')
      return this.index
   }

   isValid() {
      if (this.fromAddress === 'popCoin') return true
      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
      return publicKey.verify(this.calculateHash(), this.signature)
   }

   _makeId(length = 5) {
      var txt = ''
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      for (let i = 0; i < length; i++) {
         txt += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      return txt
   }
}

module.exports.Blockchain = Blockchain
module.exports.Block = Block
module.exports.Transaction = Transaction
